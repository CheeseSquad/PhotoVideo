
const axios = require('axios')

let mediaRecorder
let recordedBlobs

const startRecording = () => {
  recordedBlobs = []
  let options = setMimeType()

  try { mediaRecorder = new window.MediaRecorder(window.stream, options) } catch (e) { console.error('Exception while creating MediaRecorder: ' + e) }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options)
  mediaRecorder.onstop = handleStop
  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.start(10)
  console.log('MediaRecorder started', mediaRecorder)
}

const stopRecording = () => {
  mediaRecorder.stop()
  console.log('Recorded Blobs: ', recordedBlobs)
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
  let superBuffer = new window.Blob(recordedBlobs, { type: 'video/webm' })
  recordedVideo.src = window.URL.createObjectURL(superBuffer)
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

const sendVideo = () => {
  let blob = new window.Blob(recordedBlobs, { type: 'video/webm' })
  let data = new window.FormData()
  data.append('video', blob, 'needful.webm')

  const config = {
    headers: { 'content-type': 'multipart/form-data' }
  }

  axios.post('/video', data, config)
}

const setMimeType = () => {
  let options = { mimeType: 'video/webmcodecs=vp9' }
  if (!window.MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported')
    options = { mimeType: 'video/webmcodecs=vp8' }
    if (!window.MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported')
      options = { mimeType: 'video/webm' }
      if (!window.MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported')
        options = { mimeType: '' }
      }
    }
  }
  return options
}

export { startRecording, stopRecording, play }
