import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '~/utils/common'
import { TokenPayload } from '~/models/Request/User.requests'
import { UserVerifyStatus } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { Server } from 'socket.io'
import { Server as ServerHttp } from 'http'
import Conversation from '~/models/schemas/Conversations.shema'
import databaseService from '~/services/database.services'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    // Bỏ qua các validation của CORS liên quan đến port local hiện tại
    cors: { origin: 'http://localhost:3001' }
  })

  // Map lưu trữ các socket id của từng user
  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  // Sử dụng middleware socket để check authentication trước khi được kết nối
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth

    const access_token = Authorization?.split(' ')[1]

    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload
      if (verify === UserVerifyStatus.Verified) {
        new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      // Truyền decoded_authorization và access_token vào socket để xử lý logic khi sever connect
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  // Lắng nghe kết nối từ client
  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    // Lấy user id của client gửi đến
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = {
      socket_id: socket.id
    }

    // Sử dụng middleware check xem tài khoản đăng nhập đã hết access_token chưa
    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        // Nếu access_token hợp lệ thì gọi next để socket tiếp tục
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        // Nếu access_token không hợp lệ thì throw ra lỗi Unauthorized
        next(new Error('Unauthorized'))
      }
    })

    // Bắt lỗi từ middleware bên trên trả về bằng Unauthorized thì disconnect socket
    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
    })
    // Lắng nghe emit từ client 1 gửi đến là send_message
    socket.on('send_message', async (data) => {
      const { receiver_id, sender_id, content } = data.payload

      //Lấy id của người nhận
      const receiver_socket_id = users[receiver_id]?.socket_id

      // Tạo mới đối tượng conversation
      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id), // người gửi
        receiver_id: new ObjectId(receiver_id), // người nhận
        content: content
      })

      // Tạo conversations lưu vào trong database
      const result = await databaseService.conversations.insertOne(conversation)

      // Gán conversation._id bằng với result.insertedId
      conversation._id = result.insertedId
      if (!receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation,
          from: user_id
        })
      }
    })
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
    })
  })
}

export default initSocket
