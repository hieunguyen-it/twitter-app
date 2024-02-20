import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
databaseService.connect()
const app = express()
const port = 4000

app.use(express.json())
app.use('/user', usersRouter)
// Xư lý error handler khi app bị crash hoặc lỗi
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log('Example app listening on port 4000!')
})
