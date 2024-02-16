import { Request } from 'express'
import { User } from '~/models/schemas/User.schema'
import { TokenPayload } from './models/Request/User.request'

// Bổ sung thêm kiểu dữ liệu cho Interface Request
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
  }
}
