const axios = require('axios')
const { setMimeType } = require('./helpers')

let mediaRecorder
let recordedBlobs

const startRecording = () => {
  recordedBlobs = []
  let options = setMimeType()

  try { mediaRecorder = new window.MediaRecorder(window.stream, options) } catch (e) { console.error('Exception while creating MediaRecorder: ' + e) }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options)
  mediaRecorder.onstop = sendVideo()
  mediaRecorder.ondataavailable = (event) => recordedBlobs.push(event.data)
  mediaRecorder.start(10)
  console.log('MediaRecorder started', mediaRecorder)
}

const play = () => {
  let recordedVideo = document.getElementById('recorded')
  let superBuffer = new window.Blob(recordedBlobs, { type: 'video/webm' })
  recordedVideo.src = window.URL.createObjectURL(superBuffer)
  recordedVideo.addEventListener('loadedmetadata', () => {
    if (recordedVideo.duration === Infinity) {
      recordedVideo.currentTime = 1e101
      recordedVideo.ontimeupdate = () => {
        recordedVideo.currentTime = 0
        recordedVideo.ontimeupdate = () => {
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

const clearphoto = (photo, canvas) => {
  let context = canvas.getContext('2d')
  context.fillStyle = '#AAA'
  context.fillRect(0, 0, canvas.width, canvas.height)

  let data = canvas.toDataURL('image/png')
  photo.setAttribute('src', data)
}

const takepicture = (photo, video, canvas, height, width) => {
  video.classList.add('focus')
  startRecording()
  setTimeout(() => { mediaRecorder.stop() }, 3000)
  setTimeout(() => {
    let context = canvas.getContext('2d')
    if (width && height) {
      canvas.width = width
      canvas.height = height
      context.drawImage(video, 0, 0, width, height)

      let data = canvas.toDataURL('image/png')
      photo.setAttribute('src', data)
    } else {
      clearphoto(photo, canvas)
    }
    video.classList.remove('focus')
  }, 1000)
}

export { play, clearphoto, takepicture }
