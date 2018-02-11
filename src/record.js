
const axios = require('axios')

let mediaRecorder
let recordedBlobs

export const startRecording = () => {
  recordedBlobs = []
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
  try {
    mediaRecorder = new window.MediaRecorder(window.stream, options)
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

export const stopRecording = () => {
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

export const play = () => {
  download()
  let recordedVideo = document.getElementById('recorded')
  let superBuffer = new window.Blob(recordedBlobs, { type: 'video/webm' })
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

const sendVideo = () => {
  let blob = new window.Blob(recordedBlobs, { type: 'video/webm' })
  let data = new window.FormData()
  data.append('video', blob, 'needful.webm')

  const config = {
    headers: { 'content-type': 'multipart/form-data' }
  }

  axios.post('/video', data, config)
}

const download = () => {
  let blob = new window.Blob(recordedBlobs, { type: 'video/webm' })
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
