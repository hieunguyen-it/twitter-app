import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Bookmark from '~/models/schemas/Bookmark.schema'

class BookmarksServices {
  /**
   * tweet_id -> Để biết tweet nào được bookmark
   * user_id -> Để biết ai là người bookmark tweet này
   */
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return result
  }

  async unbookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })

    return result
  }
}

const bookmarksServices = new BookmarksServices()
export default bookmarksServices
