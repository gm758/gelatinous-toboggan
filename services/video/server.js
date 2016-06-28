const app = require('./app')
const { db } = require('./db')

db.connect((err) => {
  if (err) {
    console.log(err)
    return
  }
  app.listen(3001, (err) => {
    if (err) {
      throw err
    }
    console.log('listening on 3001')
  })
})
