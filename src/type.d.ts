import { Request } from 'express'
import { User } from '~/models/schemas/User.schema'

// Bổ sung thêm kiểu dữ liệu cho Interface Request
declare module 'express' {
  interface Request {
    user?: User
  }
}
