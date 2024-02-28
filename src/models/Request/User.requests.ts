import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: lamthieu0@gmail.com
 *         password:
 *           type: string
 *           example: Hieu1995@
 *
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjVkOTY2ZjMyMjdiZGM2NGIwZDVlMWVjIiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjoxLCJpYXQiOjE3MDkwODY3OTksImV4cCI6MTcwOTE3MzE5OX0.Znfog3gnA4-SGR-qV42fwokzV6KExeHFMhqmd3PxYBA'
 *         refresh_token:
 *           type: string
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjVkOTY2ZjMyMjdiZGM2NGIwZDVlMWVjIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE3MDkwODY3OTksImV4cCI6MTcxNzcyNjc5OX0.hBDpoEKwD436pAFs2IW0qz0RorpjqSSZp9mUjZgre-M'
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *           example: '65d966f3227bdc64b0d5e1ec'
 *         name:
 *           type: string
 *           description: User name
 *           example: 'hieu1995'
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *           example: 'lamthieu0@gmail.com'
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           description: User date of birth
 *           example: 2024-02-07T08:13:27.000Z
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           description: User account creation time
 *           example: 2024-02-24T03:48:03.530Z
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           description: User account last update time
 *           example: 2024-02-27T02:15:28.645Z
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *             format: MongoId
 *             description: Twitter circle IDs
 *             example: ['65d5fcb596418cb3cd318e78', '62f51cb596418cb3cd312ec8']
 *         bio:
 *           type: string
 *           description: User biography
 *           example: 'This is my bio'
 *         location:
 *           type: string
 *           description: User location
 *           example: 'San Francisco, CA'
 *         website:
 *           type: string
 *           format: uri
 *           description: User website URL
 *           example: 'https://hieunguyen.me'
 *         username:
 *           type: string
 *           description: User username
 *           example: 'HieuNguyen'
 *         avatar:
 *           type: string
 *           description: User avatar URL
 *           example: 'http:localhost:4000/images/avatars/default.png'
 *         cover_photo:
 *           type: string
 *           description: User cover photo URL
 *           example: 'http:localhost:4000/images/cover_photo/default.png'
 *
 *     UserVerifyStatus:
 *       type: number
 *       enum: ['Unverified', 'Verified', 'Banned']
 *       example: 1
 *
 */

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
  date_of_birth: string
  confirm_password: string
}
export interface LogoutRequestBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
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
