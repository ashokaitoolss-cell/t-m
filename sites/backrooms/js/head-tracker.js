// Webcam head tracking with MediaPipe Face Landmarker, entirely in the browser.
// (Shared design with sites/splat-window/js/head-tracker.js, plus head rotation.)
//
// Produces where the viewer's head is and which way it points:
//   position  the point between the eyes in millimetres, relative to the
//             camera: x to the viewer's right, y up, z towards the viewer
//   yaw       radians, positive when the viewer turns to their right
//   pitch     radians, positive when they look up
// The MediaPipe library (~11 MB of WASM) and model only load when the camera
// is first switched on.

const MP_VERSION = '0.10.35';
const MP_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const EYE_SPACING_MM = 62; // between the centres of the two eyes, adult average
const CAMERA_HFOV = (60 * Math.PI) / 180; // a typical laptop webcam
const LOST_AFTER_MS = 350;

// Eye corner landmarks in the 478-point face mesh.
const RIGHT_EYE = [33, 133];
const LEFT_EYE = [263, 362];

export class HeadTracker {
  constructor(video) {
    this.video = video;
    this.state = 'off'; // off | starting | tracking | lost | error
    this.position = null;
    this.yaw = 0;
    this.pitch = 0;
    this.landmarks = null;
    this.lastSeen = 0;
    this.error = null;
    this.onstatechange = null;
    this.filters = [new OneEuro(1.0, 0.01), new OneEuro(1.0, 0.01), new OneEuro(0.5, 0.006)];
    this.angleFilters = [new OneEuro(1.2, 0.8), new OneEuro(1.2, 0.8)];
    this.landmarkerPromise = null;
    this.lastTs = 0;
    this.lastVideoTime = -1;
  }

  get running() {
    return this.state === 'tracking' || this.state === 'lost';
  }

  async start() {
    if (this.state === 'starting' || this.running) return;
    this.setState('starting');
    const session = (this.session = {});
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access needs a secure (https) page.');
      }
      if (!this.landmarkerPromise) {
        // Download the model while the permission prompt is up; forget a failed attempt.
        const pending = createLandmarker();
        pending.catch(() => {
          if (this.landmarkerPromise === pending) this.landmarkerPromise = null;
        });
        this.landmarkerPromise = pending;
      }
      const landmarkerPromise = this.landmarkerPromise;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 60 } },
      });
      if (session !== this.session) return stopStream(stream);
      this.stream = stream;
      this.video.srcObject = stream;
      await this.video.play();
      this.landmarker = await landmarkerPromise;
      if (session !== this.session) return;
      this.filters.forEach((f) => f.reset());
      this.angleFilters.forEach((f) => f.reset());
      this.setState('lost');
      this.loop(session);
    } catch (err) {
      if (session !== this.session) return;
      this.release();
      this.error = friendlyError(err);
      this.setState('error');
      throw this.error;
    }
  }

  stop() {
    this.session = null;
    this.release();
    this.setState('off');
  }

  release() {
    if (this.stream) stopStream(this.stream);
    this.stream = null;
    this.video.srcObject = null;
    this.position = null;
    this.yaw = 0;
    this.pitch = 0;
    this.landmarks = null;
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.onstatechange?.(state);
  }

  loop(session) {
    const video = this.video;
    const useFrameCallback = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    const step = () => {
      if (session !== this.session) return;
      try {
        this.detect(useFrameCallback);
      } catch (err) {
        console.error(err);
      }
      if (useFrameCallback) video.requestVideoFrameCallback(step);
      else requestAnimationFrame(step);
    };
    step();
  }

  detect(everyCallbackIsNewFrame) {
    const video = this.video;
    if (video.readyState < 2 || !video.videoWidth) return;
    if (!everyCallbackIsNewFrame && video.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = video.currentTime;

    let ts = performance.now();
    if (ts <= this.lastTs) ts = this.lastTs + 0.01; // MediaPipe needs increasing timestamps
    this.lastTs = ts;

    const result = this.landmarker.detectForVideo(video, ts);
    const face = result.faceLandmarks && result.faceLandmarks[0];
    if (!face) {
      if (this.state === 'tracking' && ts - this.lastSeen > LOST_AFTER_MS) {
        this.landmarks = null;
        this.setState('lost');
      }
      return;
    }
    if (ts - this.lastSeen > 500) [...this.filters, ...this.angleFilters].forEach((f) => f.reset());
    const raw = eyePosition(face, video.videoWidth, video.videoHeight);
    const t = ts / 1000;
    this.position = raw.map((v, i) => this.filters[i].filter(v, t));
    const matrix = result.facialTransformationMatrixes && result.facialTransformationMatrixes[0];
    if (matrix) {
      const [yaw, pitch] = headAngles(matrix.data);
      this.yaw = this.angleFilters[0].filter(yaw, t);
      this.pitch = this.angleFilters[1].filter(pitch, t);
    }
    this.landmarks = face;
    this.lastSeen = ts;
    this.setState('tracking');
  }

  // Mirrored camera image with the tracked eyes marked, for the preview tile.
  drawPreview(canvas) {
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    const video = this.video;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    if (video.readyState >= 2 && video.videoWidth) {
      const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
      const vw = video.videoWidth * scale, vh = video.videoHeight * scale;
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(video, (w - vw) / 2, (h - vh) / 2, vw, vh);
      ctx.globalAlpha = 1;
      if (this.landmarks && this.state === 'tracking') {
        const toCanvas = (p) => [(w - vw) / 2 + p.x * vw, (h - vh) / 2 + p.y * vh];
        ctx.fillStyle = '#7dffb2';
        for (const pair of [RIGHT_EYE, LEFT_EYE]) {
          const [x, y] = toCanvas(mid(this.landmarks[pair[0]], this.landmarks[pair[1]]));
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}

async function createLandmarker() {
  const vision = await import(`${MP_BASE}/vision_bundle.mjs`);
  const fileset = await vision.FilesetResolver.forVisionTasks(`${MP_BASE}/wasm`);
  const options = (delegate) => ({
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFacialTransformationMatrixes: true,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  try {
    return await vision.FaceLandmarker.createFromOptions(fileset, options('GPU'));
  } catch (err) {
    console.warn('Face Landmarker GPU delegate unavailable, falling back to CPU.', err);
    return vision.FaceLandmarker.createFromOptions(fileset, options('CPU'));
  }
}

// Pinhole-camera estimate of the point between the eyes. Distance comes from
// how far apart the eyes look; the 3D landmark offsets keep it steady when the
// head turns. The lateral position does not depend on the assumed FOV at all.
function eyePosition(face, width, height) {
  const focal = width / 2 / Math.tan(CAMERA_HFOV / 2);
  const a = mid(face[RIGHT_EYE[0]], face[RIGHT_EYE[1]]);
  const b = mid(face[LEFT_EYE[0]], face[LEFT_EYE[1]]);
  const spacing = Math.hypot((b.x - a.x) * width, (b.y - a.y) * height, (b.z - a.z) * width);
  const z = (focal * EYE_SPACING_MM) / Math.max(spacing, 1);
  const cx = ((a.x + b.x) / 2) * width - width / 2;
  const cy = ((a.y + b.y) / 2) * height - height / 2;
  // The camera sees a mirror image: the viewer's right is the image's left.
  return [(-cx * z) / focal, (-cy * z) / focal, z];
}

// The face's forward axis is the third column of MediaPipe's column-major
// pose matrix, in a camera space with x towards the image's right and y up.
// The image is unmirrored, so a face pointing to image-right belongs to a
// viewer turned to their left. (Checked against a portrait and its mirror,
// and against the yaw implied by the 3D landmarks.)
function headAngles(m) {
  const fx = m[8], fy = m[9], fz = m[10];
  return [-Math.atan2(fx, fz), Math.atan2(fy, Math.hypot(fx, fz))];
}

function mid(p, q) {
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, z: (p.z + q.z) / 2 };
}

function stopStream(stream) {
  stream.getTracks().forEach((t) => t.stop());
}

function friendlyError(err) {
  const name = err && err.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return new Error('Camera permission was denied.');
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return new Error('No camera was found.');
  if (name === 'NotReadableError') return new Error('The camera is in use by another app.');
  if (err instanceof TypeError && /import|fetch|module/i.test(err.message)) {
    return new Error('Could not download the face tracking model.');
  }
  return err instanceof Error ? err : new Error(String(err));
}

// One Euro filter (Casiez et al. 2012): heavy smoothing when the head is
// still, little lag when it moves quickly.
class OneEuro {
  constructor(minCutoff, beta, dCutoff = 1) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }
  reset() {
    this.x = null;
    this.dx = 0;
    this.t = 0;
  }
  filter(value, t) {
    if (this.x === null) {
      this.x = value;
      this.t = t;
      return value;
    }
    const dt = Math.max(1e-3, t - this.t);
    this.t = t;
    const rawDx = (value - this.x) / dt;
    this.dx += alpha(this.dCutoff, dt) * (rawDx - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }
}

function alpha(cutoff, dt) {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}
