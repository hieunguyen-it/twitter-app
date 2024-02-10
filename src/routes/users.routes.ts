import { Router } from 'express'
import { registerController, registerValidator } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

// usersRouter.post('/login', loginValidator, registerController)
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email:string, password: string, date_of_birth: Date, confirm_password: string}
 */
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter
