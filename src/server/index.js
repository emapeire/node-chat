import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { createClient } from '@libsql/client'
import 'dotenv/config.js'

const port = process.env.PORT ?? 3000

const db = createClient({
  url: 'libsql://obliging-hulk-emapeire.turso.io',
  authToken: process.env.DB_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
    user TEXT NOT NULL,
  )
`)

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})

io.on('connection', async (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('chat message', async (msg) => {
    let result
    try {
      result = await db.execute({
        sql: 'INSERT INTO messages (content) VALUES (:msg)',
        args: { msg }
      })
    } catch (err) {
      console.error(err)
      return
    }
    io.emit('chat message', msg, result.lastInsertRowid.toString())
  })

  if (!socket.recovered) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM messages WHERE id > ?',
        args: [socket.handshake.auth.serverOffset ?? 0]
      })
      result.rows.forEach((row) => {
        socket.emit('chat message', row.content, row.id.toString())
      })
    } catch (err) {
      console.error(err)
    }
  }
})

app.use(logger('dev'))
app.disable('x-powered-by')

app.get('/', (_req, res) => {
  res.sendFile(process.cwd() + '/src/client/index.html')
})

server.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`)
})
