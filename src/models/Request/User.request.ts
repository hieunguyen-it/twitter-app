import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'

export interface LoginRequestBody {
  email: string
  password: string
}
export interface VerifyEmailRequestBody {
  email_verify_token: string
}

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  date_of_birth: Date
  confirm_password: string
}
export interface LogoutRequestBody {
  refresh_token: string
}

export interface ResetPasswordRequestBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowUserReqBody {
  followed_user_id: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface UnFollowUserReqParams extends ParamsDictionary {
  user_id: string
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}

export interface ForgotPasswordRequestBody {
  email: string
}
export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}
