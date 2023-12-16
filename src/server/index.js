import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
  })
})

app.use(logger('dev'))
app.disable('x-powered-by')

app.get('/', (_req, res) => {
  res.sendFile(process.cwd() + '/src/client/index.html')
})

server.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`)
})
