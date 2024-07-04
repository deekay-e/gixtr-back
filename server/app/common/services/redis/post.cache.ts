import Logger from 'bunyan'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface'

const log: Logger = config.createLogger('postCache')

export class PostCache extends BaseCache {
  constructor() {
    super('postCache')
  }

  /**
   * addPostToCache
   */
  public async addPostToCache(data: ISavePostToCache ): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt
    } = createdPost
    const dataToSave = {
      _id: `${_id}`,
      userId: `${userId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      profilePicture: `${profilePicture}`,
      post: `${post}`,
      bgColor: `${bgColor}`,
      feelings: `${feelings}`,
      privacy: `${privacy}`,
      gifUrl: `${gifUrl}`,
      commentsCount: `${commentsCount}`,
      imgVersion: `${imgVersion}`,
      imgId: `${imgId}`,
      reactions: `${JSON.stringify(reactions)}`,
      createdAt: `${createdAt}`
    }

    try {
      if (!this.client.isOpen) await this.client.connect()

      const postsCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount')
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      multi.ZADD('post', { score: parseInt(`${uId}`, 10), value: `${key}` })
      multi.HSET(`posts:${key}`, dataToSave)

      const newPostsCount: number = parseInt(postsCount[0], 10) + 1
      multi.HSET(`users:${currentUserId}`, ['postsCount', `${newPostsCount}`])

      multi.exec()
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}
