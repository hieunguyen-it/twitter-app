import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterRequestBody } from '~/models/Request/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USERS_MESSAGES } from '~/constants/messages'
config()

class UsersServices {
  // Tạo access token cho user
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }

  // Tạo refresh token cho user
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN }
    })
  }

  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN }
    })
  }
  // Đăng ký user với password đã hash
  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    console.log('email_verify_token', email_verify_token)

    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id.toString())

    // Lưu refresh token vào trong database
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    }
  }

  // Kiểm tra email có tồn tại hay không
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  // Kiểm tra người dùng có tồn tại hay không
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  // Đăng xuất user
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
  // Verify email
  async verifyEmail(user_id: string) {
    // Tạo giá trị cập nhật: dùng new Date() -> Thời điểm xảy ra trước
    // MongoDB cập nhật giá trị: dùng $currentDate: { updated_at: true } -> Thời điểm khi mongoDB cập nhật giá trị
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken(user_id),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: '$$NOW' }
          // $currentDate: { updated_at: true }
        }
      ])
    ])

    const [access_token, refresh_token] = token

    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)

    console.log('email_verify_token', email_verify_token)

    // Cập nhật lại giát trị email_verify_token trong document user
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { email_verify_token },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword(user_id: string) {
    /*
     *  Lấy user_id từ controller
     * Xử lý logic hàm signForgotPasswordToken để lấy ra forgot_password_token
     */
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    /*
     * Tiến hành cập nhật forgot_password_token trong document user
     */
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { forgot_password_token },
        $currentDate: {
          updated_at: true
        }
      }
    )
    /*
     * Gửi email kèm đường link đến email người dùng: https://twitter.com/forgotpassword?token=token
     */
    console.log('forgot_password_token', forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
}

const usersServices = new UsersServices()
export default usersServices
