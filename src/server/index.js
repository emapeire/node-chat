import express from 'express'
import logger from 'morgan'

const port = process.env.PORT ?? 3000

const app = express()
app.use(logger('dev'))
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/src/client/index.html')
})

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`)
})
