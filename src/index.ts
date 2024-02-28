// import fs from 'fs'
import cors from 'cors'
import YAML from 'yaml'
// import path from 'path'
import express from 'express'
import { config } from 'dotenv'
import { createServer } from 'http'
import swaggerJsdoc from 'swagger-jsdoc'
import initSocket from './utils/socket'
import swaggerUi from 'swagger-ui-express'
import { initFolder } from './utils/file'
import usersRouter from './routes/users.routes'
import tweetsRouter from './routes/tweet.routes'
import staticRouter from './routes/static.routes'
import mediasRouter from './routes/medias.routes'
import searchRouter from './routes/search.routes'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import bookmarksRouter from './routes/bookmarks.routes'
import databaseService from './services/database.services'
import conversationsRouter from './routes/conversations.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'

// const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

const options: swaggerJsdoc.Options = {
  // definition: {
  //   openapi: '3.0.0',
  //   info: {
  //     title: 'X clone (Twitter API)',
  //     version: '1.0.0'
  //   },
  //   // Khai báo mở rộng để có thêm option Authorize trên swagger
  //   components: {
  //     securitySchemes: {
  //       BearerAuth: {
  //         type: 'http',
  //         scheme: 'bearer',
  //         bearerFormat: 'JWT'
  //       }
  //     }
  //   }
  // },
  // apis: ['./src/routes/*.routes.ts', './src/models/Request/*.requests.ts']
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X clone (Twitter API)',
      version: '1.0.0'
    }
  },
  apis: ['./openapi/*.yaml']
}
const openapiSpecification = swaggerJsdoc(options)

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
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
