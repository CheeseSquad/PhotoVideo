const { play, clearphoto, takepicture } = require('./record')

const width = 1080
let height

let streaming = false

const startup = () => {
  let video = document.getElementById('video')
  let canvas = document.getElementById('canvas')
  let photo = document.getElementById('photo')
  let startbutton = document.getElementById('startbutton')
  let playButton = document.getElementById('doTheThing')

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

  startbutton.addEventListener('click', (ev) => takepicture(photo, video, canvas, height, width))

  playButton.addEventListener('click', (ev) => play())

  clearphoto(photo, canvas)
}

window.addEventListener('load', startup, false)
