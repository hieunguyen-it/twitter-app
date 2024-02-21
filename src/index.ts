import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
config()

databaseService.connect()
const app = express()
const port = process.env.PORT || 4000

// Tạo folder uploads
initFolder()

app.use(express.json())
app.use('/user', usersRouter)
app.use('/medias', mediasRouter)

/* Ưu điểm việc sử dụng router để serving 1 static file thì
  nó có khả năng custom sâu hơn, ví dụ: trả ra lỗi cụ thể hơn khi dùng 
  app.use('/static', express.static(UPLOAD_IMAGE_DIR))
*/
app.use('/static', staticRouter)

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// Xư lý error handler khi app bị crash hoặc lỗi
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log('Example app listening on port 4000!')
})
