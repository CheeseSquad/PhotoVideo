
const axios = require('axios')
// The width and height of the captured photo. We will set the
// width to the value defined here, but the height will be
// calculated based on the aspect ratio of the input stream.

let width = 1080    // We will scale the photo width to this
let height = 0     // This will be computed based on the input stream

// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.

let streaming = false
let recordedBlobs
let mediaRecorder

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.

let video = null
let canvas = null
let photo = null
let startbutton = null

const startup = () => {
  video = document.getElementById('video')
  canvas = document.getElementById('canvas')
  photo = document.getElementById('photo')
  startbutton = document.getElementById('startbutton')

  document.getElementById('doTheThing').onclick = play

  navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia)

  navigator.getMedia(
    {
      video: true,
      audio: false
    },
    function (stream) {
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream
      } else {
        let vendorURL = window.URL || window.webkitURL
        video.src = vendorURL.createObjectURL(stream)
      }
      window.stream = stream
      video.play()
    },
    function (err) {
      console.log('An error occured! ' + err)
    }
  )

  video.addEventListener('canplay', function (ev) {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width)

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.

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

  startbutton.addEventListener('click', function (ev) {
    takepicture()
    ev.preventDefault()
  }, false)

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

const startRecording = () => {
  recordedBlobs = []
  let options = { mimeType: 'video/webmcodecs=vp9' }
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported')
    options = { mimeType: 'video/webmcodecs=vp8' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported')
      options = { mimeType: 'video/webm' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported')
        options = { mimeType: '' }
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(window.stream, options)
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e)
    window.alert('Exception while creating MediaRecorder: ' + e + '. mimeType: ' + options.mimeType)
    return
  }

  document.getElementById('doTheThing').onclick = play
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options)
  mediaRecorder.onstop = handleStop
  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.start(10) // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder)
}

const stopRecording = () => {
  mediaRecorder.stop()
  console.log('Recorded Blobs: ', recordedBlobs)
}

const handleSuccess = (stream) => {
  console.log('getUserMedia() got stream: ', stream)
  window.stream = stream
  //gumVideo.srcObject = stream
}

const handleError = (error) => {
  console.log('navigator.getUserMedia error: ', error)
}

const handleSourceOpen = (event) => {
  console.log('MediaSource opened')
  //sourceBuffer = mediaSource.addSourceBuffer('video/webm codecs="vp8"')
  //console.log('Source buffer: ', sourceBuffer)
}

const handleDataAvailable = (event) => {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data)
  }
}

const handleStop = (event) => {
  console.log('Recorder stopped: ', event)
  sendVideo()
}

const play = () => {
  let recordedVideo = document.getElementById('recorded')
  let superBuffer = new Blob(recordedBlobs, { type: 'video/webm' })
  recordedVideo.src = window.URL.createObjectURL(superBuffer)
  // workaround for non-seekable video taken from
  // https://bugs.chromium.org/p/chromium/issues/detail?id=642012#c23
  recordedVideo.addEventListener('loadedmetadata', function () {
    if (recordedVideo.duration === Infinity) {
      recordedVideo.currentTime = 1e101
      recordedVideo.ontimeupdate = function () {
        recordedVideo.currentTime = 0
        recordedVideo.ontimeupdate = function () {
          delete recordedVideo.ontimeupdate
          recordedVideo.play()
        }
      }
    }
  })
}

const download = () => {
  let blob = new Blob(recordedBlobs, { type: 'video/webm' })
  let url = window.URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = 'test.webm'
  document.body.appendChild(a)
  a.click()
  setTimeout(function () {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 100)
}

const sendVideo = () => {
  let blob = new Blob(recordedBlobs, { type: 'video/webm' })
  let data = new FormData()
  data.append('video', blob, 'needful.webm')

  const config = {
    headers: { 'content-type': 'multipart/form-data' }
  }

  axios.post('/video', data, config)
}

window.addEventListener('load', startup, false)
