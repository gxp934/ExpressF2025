const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/helloagain', (req, res) => {
  res.send('<h1>Hello again!</h1>')
})

app.get('/another', (req, res) => {
  res.send('another route')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
