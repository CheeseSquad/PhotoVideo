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