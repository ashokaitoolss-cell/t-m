// Where the viewer's eye is, in "window units": the origin is the centre of
// the page, x right, y up, z out of the screen towards the viewer, and the
// page is exactly 1 unit tall.

const TYPICAL_DISTANCE_MM = { desktop: 560, phone: 330 };

function isPhone() {
  return matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;
}

// Browsers don't expose physical size; CSS pixels are about this big on
// common laptops/monitors and phones respectively.
export function mmPerCssPixel() {
  return isPhone() ? 0.165 : 0.24;
}

export function defaultDistance() {
  const mm = isPhone() ? TYPICAL_DISTANCE_MM.phone : TYPICAL_DISTANCE_MM.desktop;
  return clamp(mm / (innerHeight * mmPerCssPixel()), 1.6, 4.5);
}

// Where the webcam is relative to the centre of the page, in CSS px (x right,
// y up). Assumes it sits centred just above the top edge of the screen — or
// beside it on a phone held sideways.
export function cameraOffsetPx() {
  const bezel = 6 / mmPerCssPixel();
  const angle = screen.orientation ? screen.orientation.angle : 0;
  if (isPhone() && (angle === 90 || angle === 270)) {
    const side = innerWidth / 2 + bezel;
    return [angle === 90 ? -side : side, 0];
  }
  if (document.fullscreenElement || window.top !== window) {
    return [0, innerHeight / 2 + bezel];
  }
  const left = clamp(screenX - (screen.availLeft || 0), 0, Math.max(0, screen.width - outerWidth));
  const top = clamp(screenY - (screen.availTop || 0), 0, Math.max(0, screen.height - outerHeight));
  const chromeX = Math.max(0, (outerWidth - innerWidth) / 2);
  const chromeTop = Math.max(0, outerHeight - innerHeight);
  const pageCenterX = left + chromeX + innerWidth / 2;
  const pageCenterY = top + chromeTop + innerHeight / 2;
  return [screen.width / 2 - pageCenterX, pageCenterY + bezel];
}

// Head position from the tracker (mm, relative to the camera) → eye position
// in window units. `calibration` is a mm offset set by "recenter".
export function faceToEye(headMm, { calibration = [0, 0], strength = 1 } = {}) {
  const mm = mmPerCssPixel();
  const unit = innerHeight * mm;
  const [cx, cy] = cameraOffsetPx();
  const x = (headMm[0] + cx * mm + calibration[0]) / unit;
  const y = (headMm[1] + cy * mm + calibration[1]) / unit;
  const z = headMm[2] / unit;
  return [clamp(x * strength, -4, 4), clamp(y * strength, -4, 4), clamp(z, 0.45, 12)];
}

// The calibration that would put the head exactly in front of the centre.
export function recenterCalibration(headMm) {
  const mm = mmPerCssPixel();
  const [cx, cy] = cameraOffsetPx();
  return [-(headMm[0] + cx * mm), -(headMm[1] + cy * mm)];
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
