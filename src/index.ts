import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()

const port = 3001

app.use(express.json())
app.use('/user', usersRouter)
databaseService.connect()

app.listen(port, () => {
  console.log('Example app listening on port 3000!')
})
