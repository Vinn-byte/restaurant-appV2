const orderForm = document.getElementById('orderForm');
const orderConfirmation = document.getElementById('orderConfirmation');
const openScannerButton = document.getElementById('openScannerButton');
const stopScannerButton = document.getElementById('stopScannerButton');
const scannerStatus = document.getElementById('scannerStatus');
const video = document.getElementById('video');
const scanCanvas = document.getElementById('scanCanvas');
const qrCodeElement = document.getElementById('qrCode');
const canvasContext = scanCanvas.getContext('2d');

let scanStream = null;
let animationFrameId = null;
const qrMenuUrl = `${window.location.origin}${window.location.pathname}?menu=true`;

function generateQrCode() {
  QRCode.toCanvas(qrCodeElement, qrMenuUrl, {
    width: 220,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  }).catch((error) => {
    console.error('QR code generation failed:', error);
  });
}

function showMessage(message) {
  scannerStatus.textContent = message;
}

function stopScanner() {
  if (scanStream) {
    scanStream.getTracks().forEach((track) => track.stop());
    scanStream = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  video.classList.add('hidden');
  scanCanvas.classList.add('hidden');
  stopScannerButton.classList.add('hidden');
  openScannerButton.classList.remove('hidden');
  showMessage('Scanner stopped. You can reopen it anytime.');
}

function handleScanResult(result) {
  if (!result) {
    showMessage('No QR code found yet. Point your camera steadily at the code.');
    return;
  }

  showMessage(`QR code scanned: ${result}`);
  stopScanner();

  if (result.includes('?menu=true')) {
    window.location.href = result;
    return;
  }

  alert(`Scanned QR data:\n${result}`);
}

function tick() {
  if (!video.videoWidth || !video.videoHeight) {
    animationFrameId = requestAnimationFrame(tick);
    return;
  }

  scanCanvas.width = video.videoWidth;
  scanCanvas.height = video.videoHeight;
  canvasContext.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height);
  const imageData = canvasContext.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  if (code) {
    handleScanResult(code.data);
  } else {
    showMessage('Searching for a QR code...');
    animationFrameId = requestAnimationFrame(tick);
  }
}

function isSecureContextAvailable() {
  return window.isSecureContext || ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

const scannerFallback = document.getElementById('scannerFallback');

function showFallbackMessage(show) {
  if (scannerFallback) {
    scannerFallback.classList.toggle('hidden', !show);
  }
}

async function startScanner() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showMessage('Your browser does not support camera access.');
    showFallbackMessage(true);
    return;
  }

  if (!isSecureContextAvailable()) {
    showMessage('Camera access requires HTTPS or localhost on many mobile browsers.');
    showFallbackMessage(true);
    return;
  }

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = scanStream;
    video.classList.remove('hidden');
    scanCanvas.classList.remove('hidden');
    stopScannerButton.classList.remove('hidden');
    openScannerButton.classList.add('hidden');
    showFallbackMessage(false);
    showMessage('Starting camera... point it at the QR code.');
    video.play();
    animationFrameId = requestAnimationFrame(tick);
  } catch (error) {
    showMessage('Camera access denied or unavailable.');
    showFallbackMessage(true);
    console.error(error);
  }
}

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const table = document.getElementById('tableNumber').value.trim();
  const dish = document.getElementById('dishName').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  if (!name || !table || !dish) {
    alert('Please complete your name, table number, and dish selection.');
    return;
  }

  const orderSummary = `Thanks ${name}!\nTable: ${table}\nDish: ${dish}${notes ? `\nNotes: ${notes}` : ''}`;
  orderConfirmation.classList.remove('hidden');
  orderConfirmation.querySelector('p').textContent = orderSummary;
  orderForm.reset();
});

openScannerButton.addEventListener('click', startScanner);
stopScannerButton.addEventListener('click', stopScanner);

function scrollToMenuOnQuery() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('menu') === 'true') {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      setTimeout(() => menuSection.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  generateQrCode();
  scrollToMenuOnQuery();
});
