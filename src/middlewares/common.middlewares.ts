import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type FilterKeys<T> = Array<keyof T>

// Filter body
// pick lodash để lọc ra thông tin cần thiết từ body
// các body req khác truyền vào khác những giá trị đã khai báo trong mảng pick sẽ bị loại bỏ
// trước khi body được gửi đi => giúp hạn chế rủi ro việc truyền những dữ liệu không cần thiết
// gây ảnh hưởng đến hệ thống

export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
