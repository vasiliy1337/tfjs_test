const color = "black";
const drawLineWidth = 1;

let isDrawing = false;
let x = 0, y = 0;
let offsetX = 0, offsetY = 0, scale = 1;

let canvas, ctx

async function initCanvas() {
  canvas = document.getElementById("canvasDigit")
  ctx = canvas.getContext("2d", { willReadFrequently: true })

  // mouse 
  canvas.addEventListener("mousedown", (e) => {
    updateCanvasMetrics();
    isDrawing = true;
    const pos = getCanvasPos(e.clientX, e.clientY);
    x = pos.x;
    y = pos.y;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e.clientX, e.clientY);
    drawLine(ctx, x, y, pos.x, pos.y);
    x = pos.x;
    y = pos.y;
  });

  window.addEventListener("mouseup", (e) => {
      if (isDrawing) {
        isDrawing = false;
        if (e.target === canvas) {
          evaluateModel();
        }
      }
  });

  // touch
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (e.touches.length > 1) return; // ignore multi-touch
    updateCanvasMetrics();

    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);
    isDrawing = true;
    x = pos.x;
    y = pos.y;
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isDrawing || e.touches.length > 1) return;

    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);
    drawLine(ctx, x, y, pos.x, pos.y);
    x = pos.x;
    y = pos.y;
  });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (isDrawing) {
      isDrawing = false;
      evaluateModel();
    }
  });
}

function updateCanvasMetrics() {
  const rect = canvas.getBoundingClientRect();
  offsetX = rect.left;
  offsetY = rect.top;
  scale = canvas.clientWidth / canvas.width;
}

function getCanvasPos(clientX, clientY) {
  return {
    x: (clientX - offsetX) / scale,
    y: (clientY - offsetY) / scale
  };
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.lineWidth = drawLineWidth;
  ctx.lineJoin = "round";
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function clearArea() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
