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

import conversationsRouter from './routes/conversations.routes'
import initSocket from './utils/socket'

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
app.use('/conversations', conversationsRouter)

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// Xư lý error handler khi app bị crash hoặc lỗi
app.use(defaultErrorHandler)

// Khởi tạo socket server
initSocket(httpServer)

httpServer.listen(port, () => {
  console.log('Example app listening on port 4000!')
})
