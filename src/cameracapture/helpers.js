export const MediaRecorderPromise = (options) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(new window.MediaRecorder(window.stream, options))
    } catch (err) {
      return reject(err)
    }
  })
}

export const setMimeType = () => {
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
