// Constants
const GRID_SIZE = 28

const serverIP = "http://localhost:8080"

let model = null
let probContainer, resetBtn

window.addEventListener("DOMContentLoaded", init)

async function init() {
  resetBtn = document.getElementById("resetButton")
  probContainer = document.getElementById("probabilities")
  initCanvas()

  const minimumLoadingTime = 100;
  const startTime = Date.now();
  loadModel().then(() => {
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minimumLoadingTime) {
      return new Promise(resolve => 
        setTimeout(resolve, minimumLoadingTime - elapsedTime)
      );
    }
  }).then(() => {
    hideLoadingScreen();
  }).catch(error => {
    console.error('Loading error:', error);
  });
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const content = document.getElementById('content');
  loadingScreen.style.opacity = '0';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    content.style.opacity = '1';
  }, 300);
}

async function loadModel() {
  try {
    model = await tf.loadLayersModel(`${serverIP}/model/model.json`)
    console.log("Model loaded successfully")
  } catch (error) {
    console.error("Failed to load model:", error)
  }
}

async function evaluateModel() {
  if (!model) return

  try {
    let data = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;
    let grayscale = [];
    for (let i = 3; i < data.length; i += 4) {
      grayscale.push(data[i]/255);
    }
    const inputTensor = tf.tensor(grayscale).reshape([1, 28, 28])
    const prediction = model.predict(inputTensor)
    const probabilities = await prediction.dataSync()
    updateProbabilities(Array.from(probabilities))
    inputTensor.dispose()
    prediction.dispose()
  } catch (error) {
    console.error("Error during model evaluation:", error)
  }
}

function updateProbabilities(probabilities) {
  let maxIndex = -1
  if (!probabilities.every((item) => item === 0)) {
    const maxProb = Math.max(...probabilities)
    maxIndex = probabilities.indexOf(maxProb)
  }
  probabilities.forEach((prob, index) => {
    const bar = document.getElementById(`prob-bar-${index}`);
    const number = bar.previousElementSibling;
    bar.style.backgroundColor = `rgba(95, 191, 255, ${prob})`;
    bar.style.height = `${prob*100}%`;
    if (index === maxIndex) {
      number.style.color = "white";
      number.style.border = `2px solid #0099ff`;
      number.style.backgroundColor = '#30acff';
    } else {
      number.style.color = "black";
      number.style.border = '';
      number.style.backgroundColor = '';
    }
  })
}

async function onLabelPress(label) {
  try {
    const response = await fetch(`${serverIP}/api/random-image?label=${label}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    clearData()
    drawImage(data.image)
    evaluateModel()
  } catch (error) {
    console.error("Error fetching random image:", error)
  }
}

function clearData() {
  clearArea()
  updateProbabilities(new Array(10).fill(0))
}