const { play, startRecording, stopRecording } = require('./record')

// The width and height of the captured photo. We will set the
// width to the value defined here, but the height will be
// calculated based on the aspect ratio of the input stream.

let width = 1080    // We will scale the photo width to this
let height = 0     // This will be computed based on the input stream

// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.

let streaming = false
// The various HTML elements we need to configure or control. These
// will be set by the startup() function.

let video = null
let canvas = null
let photo = null
let startbutton = null
let playButton = null

const startup = () => {
  video = document.getElementById('video')
  canvas = document.getElementById('canvas')
  photo = document.getElementById('photo')
  startbutton = document.getElementById('startbutton')
  playButton = document.getElementById('doTheThing')

  navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia)

  navigator.getMedia({ video: true, audio: false }, (stream) => {
    if (navigator.mozGetUserMedia) {
      video.mozSrcObject = stream
    } else {
      let vendorURL = window.URL || window.webkitURL
      video.src = vendorURL.createObjectURL(stream)
    }
    window.stream = stream
    video.play()
  }, (err) => {
    console.log('An error occured! ' + err)
  })

  video.addEventListener('canplay', (ev) => {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width)

      if (isNaN(height)) {
        height = width / (4 / 3)
      }

      video.setAttribute('width', width)
      video.setAttribute('height', height)
      canvas.setAttribute('width', width)
      canvas.setAttribute('height', height)
      streaming = true
    }
  }, false)

  startbutton.addEventListener('click', (ev) => takepicture())

  playButton.addEventListener('click', (ev) => play())

  clearphoto()
}

// Fill the photo with an indication that none has been
// captured.

const clearphoto = () => {
  let context = canvas.getContext('2d')
  context.fillStyle = '#AAA'
  context.fillRect(0, 0, canvas.width, canvas.height)

  let data = canvas.toDataURL('image/png')
  photo.setAttribute('src', data)
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.

const takepicture = () => {
  video.classList.add('focus')
  startRecording()
  setTimeout(() => { stopRecording() }, 3000)
  setTimeout(() => {
    let context = canvas.getContext('2d')
    if (width && height) {
      canvas.width = width
      canvas.height = height
      context.drawImage(video, 0, 0, width, height)

      let data = canvas.toDataURL('image/png')
      photo.setAttribute('src', data)
    } else {
      clearphoto()
    }
    video.classList.remove('focus')
  }, 1000)
}

window.addEventListener('load', startup, false)
