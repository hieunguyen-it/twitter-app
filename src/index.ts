import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetsRouter from './routes/tweet.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'

config()

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
})
const app = express()
const httpServer = createServer(app)
app.use(cors())
const port = process.env.PORT || 4000

// Tạo folder uploads
initFolder()

app.use(express.json())
app.use('/user', usersRouter)
app.use('/medias', mediasRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/search', searchRouter)

/* Ưu điểm việc sử dụng router để serving 1 static file thì
  nó có khả năng custom sâu hơn, ví dụ: trả ra lỗi cụ thể hơn khi dùng 
  app.use('/static', express.static(UPLOAD_IMAGE_DIR))
*/
app.use('/static', staticRouter)
app.use('/tweets', tweetsRouter)

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// Xư lý error handler khi app bị crash hoặc lỗi
app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  // Bỏ qua các validation của CORS liên quan đến port local hiện tại
  cors: { origin: 'http://localhost:3001' }
})

// Map lưu trữ các socket id của từng user
const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

// Lắng nghe kết nối từ client
io.on('connection', (socket) => {
  // Lấy user id của client gửi đến
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  // Lắng nghe emit từ client 1 gửi đến là private message
  socket.on('private message', (data) => {
    //Lấy id của người nhận
    const receiver_socket_id = users[data.to]?.socket_id
    if (!receiver_socket_id) {
      return
    }
    // Gửi message từ client 1 đến client 2 (người nhận)
    socket.to(receiver_socket_id).emit('recevier private message', {
      content: data.content,
      from: user_id
    })
    console.log('receiver_socket_id', receiver_socket_id)
  })
  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})

httpServer.listen(port, () => {
  console.log('Example app listening on port 4000!')
})
