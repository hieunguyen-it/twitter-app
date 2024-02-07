import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'lamthieu@gmail.com' && password === 'hieu1995') {
    res.status(200).json({
      message: 'Login Successful'
    })
  }

  return res.status(400).json({
    error: 'Login fail'
  })
}
