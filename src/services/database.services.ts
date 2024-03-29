import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Conversation from '~/models/schemas/Conversations.shema'
import { envConfig } from '~/constants/config'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@cluster0.cdwqkcb.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }

  // Kết nối database
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('error', error)
      throw error
    }
  }

  /*
   * Tip: Performance tối ưu index khi khởi động sever
   *  example: const exists = await this.users.indexExists(['email_1_password_1', 'username_1', 'email_1'])
   */

  async indexUser() {
    const exists = await this.users.indexExists(['email_1_password_1', 'username_1', 'email_1'])
    // Tạo index cho collection Users
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  // Tạo index cho token để giảm thời gian tìm kiếm trong collection: refresh_token
  // Ngoài ra với những exp(thời gian hết hạn của 1 refresh token) thì cũng ta nên tạo index dựa vào exp
  // và gán với expireAfterSeconds: 0 (Nghĩa là với exp đã hết hạn theo date hệ thống thì mongodb sẽ dựa vào exp để xóa tự động bản ghi đó đi vì nó không còn giá trị nữa)
  async indexRefreshTokens() {
    const exists = await this.users.indexExists(['exp_1', 'token_1'])
    // Tạo index cho collection RefreshTokens
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexVideoStatus() {
    const exists = await this.users.indexExists(['name_1'])
    // Tạo index cho collection VideoStatus
    if (!exists) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }

  async indexFollowers() {
    const exists = await this.users.indexExists(['user_id_1_followed_user_id_1'])
    // Tạo index cho collection Follower
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 }, { unique: true })
    }
  }
  // Tạo collection Users
  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUsersCollection)
  }

  // Tạo collection RefreshTokens
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection)
  }

  // Tạo collection Follower
  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection)
  }

  // Tạo collection VideoStatus
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(envConfig.dbVideoStatusCollection)
  }

  // Tạo collection Tweets
  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagsCollection)
  }

  // Tạo collection Bookmarks
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection)
  }

  // Tạo collection cho Conversations
  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationCollection)
  }
}

const databaseService = new DatabaseService()

export default databaseService
