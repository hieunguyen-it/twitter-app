import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at?: Date
  iat: number
  exp: number
}

export default class RefreshToken {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at: Date
  iat: Date
  exp: Date

  constructor({ _id, token, user_id, created_at, iat, exp }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.user_id = user_id
    this.created_at = created_at || new Date()
    this.iat = new Date(iat * 1000) // Convert Epoch time to Date
    this.exp = new Date(exp * 1000) // Convert Epoch time to Date
  }
}
