import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/Request/Tweet.request'
import { TokenPayload } from '~/models/Request/User.request'
import tweetsServices from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsServices.createTweet(user_id, req.body)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  // const result = await tweetsServices.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  // const tweet = {
  //   ...req.tweet,
  //   guest_views: result.guest_views,
  //   user_views: result.user_views,
  //   updated_at: result.updated_at
  // }
  return res.json({
    message: 'Get Tweet Successfully'
    // result: tweet
  })
}
