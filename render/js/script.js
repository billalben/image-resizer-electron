const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

// Load image and show form
function loadImage(event) {
  const file = event.target.files[0];

  // Check if file is an image
  if (!isFileImage(file)) {
    alert('Please select an image', 'error');
    return;
  }

  // Add current height and width to form using the URL API
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  // Show form, image name and output path
  form.style.display = 'block';
  filename.innerHTML = img.files[0].name;
  //   outputPath.innerText = path.join(os.homedir(), 'imageresizer');
  outputPath.innerText = window.path.join(window.os.homedir(), 'Downloads', 'ImageResizer');
}

// Make sure file is an image
function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  return file && acceptedImageTypes.includes(file['type']);
}

// Resize image
function resizeImage(event) {
  event.preventDefault();

  if (!img.files[0]) {
    alert('Please upload an image', 'error');
    return;
  }

  if (widthInput.value === '' || heightInput.value === '') {
    alert('Please enter a width and height', 'error');
    return;
  }

  const file = img.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const imgBuffer = event.target.result; // Read image as buffer
    // console.log('Sending buffer to main process');

    window.ipcRenderer.send('image:resize', {
      imgBuffer, // Send the image buffer
      filename: file.name, // Send filename
      height: heightInput.value,
      width: widthInput.value,
    });
  };

  reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
}

// When done, show message
ipcRenderer.on('image:done', () => alert(`Image resized to ${heightInput.value} x ${widthInput.value}`), 'success');

function alert(message, type) {
  const styleToast = {};

  if (type === 'success') {
    styleToast.backgroundColor = 'green';
  } else if (type === 'error') {
    styleToast.backgroundColor = 'red';
  } else {
    styleToast.backgroundColor = 'blue';
  }

  window.Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      ...styleToast,
      color: 'white',
      textAlign: 'center',
    },
  });
}

// File select listener
img.addEventListener('change', loadImage);

// Form submit listener
form.addEventListener('submit', resizeImage);
