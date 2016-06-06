import downloadTranscodeUpload from './util'
export default (app) => {
  app.put('/api/movToMp4', (req, res) => downloadTranscodeUpload(req, res))
}
