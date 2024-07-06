import Logger from 'bunyan'

import { config } from '@/config'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import {
  IGetPostsQuery, IPostDocument, ISavePostToCache
} from '@post/interfaces/post.interface'
import { Utils } from '@global/helpers/utils'
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'

const log: Logger = config.createLogger('postCache')

export type PostCacheMultiType =
  string | number | Buffer | RedisCommandRawReply | IPostDocument | IPostDocument[]

export class PostCache extends BaseCache {
  constructor() {
    super('postCache')
  }

  /**
   * addPost
   */
  public async addPost(data: ISavePostToCache ): Promise<void> {
    const { key, currentUserId, uId, newPost } = data
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
      scope,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt
    } = newPost
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
      scope: `${scope}`,
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

  /**
   * getPost
   */
  public async getPost(key: string): Promise<IPostDocument | null> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const post: IPostDocument = await this.client
        .HGETALL(`posts:${key}`) as unknown as IPostDocument

        post.createdAt = new Date(Utils.parseJson(`${post.createdAt}`))
        post.commentsCount = Utils.parseJson(`${post.commentsCount}`)
        post.reactions = Utils.parseJson(`${post.reactions}`)

      return post
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getPosts
   */
  public async getPosts(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true })
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      for (const score of reply) multi.HGETALL(`posts:${score}`)

      const posts: IPostDocument[] = []
      const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType
      for (const post of replies as IPostDocument[]) {
        post.createdAt = new Date(Utils.parseJson(`${post.createdAt}`))
        post.commentsCount = Utils.parseJson(`${post.commentsCount}`)
        post.reactions = Utils.parseJson(`${post.reactions}`)
        posts.push(post)
      }

      return posts
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getPostsCount
   */
  public async getPostsCount(): Promise<number> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const count: number = await this.client.ZCARD('post')
      return count
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getPostsWithImages
   */
  public async getPostsWithImages(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true })
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      for (const score of reply) multi.HGETALL(`posts:${score}`)

      const posts: IPostDocument[] = []
      const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType
      for (const post of replies as IPostDocument[]) {
        if (!(post.imgId && post.imgVersion) && !post.gifUrl) continue
        post.createdAt = new Date(Utils.parseJson(`${post.createdAt}`))
        post.commentsCount = Utils.parseJson(`${post.commentsCount}`)
        post.reactions = Utils.parseJson(`${post.reactions}`)
        posts.push(post)
      }

      return posts
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getUserPosts
   */
  public async getUserPosts(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const reply: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' })
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      for (const score of reply) multi.HGETALL(`posts:${score}`)

      const posts: IPostDocument[] = []
      const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType
      for (const post of replies as IPostDocument[]) {
        post.createdAt = new Date(Utils.parseJson(`${post.createdAt}`))
        post.commentsCount = Utils.parseJson(`${post.commentsCount}`)
        post.reactions = Utils.parseJson(`${post.reactions}`)
        posts.push(post)
      }

      return posts
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getUserPostsCount
   */
  public async getUserPostsCount(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const count: number = await this.client.ZCOUNT('post', uId, uId)
      return count
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * deletePost
   */
  public async deletePost(key: string, userId: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const postsCount: string[] = await this.client.HMGET(`users:${userId}`, 'postsCount')
      const count: number = parseInt(postsCount[0], 10) - 1
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      multi.ZREM('post', `${key}`)
      multi.DEL(`posts:${key}`)
      multi.DEL(`comments:${key}`)
      multi.DEL(`reactions:${key}`)
      multi.HSET(`users:${userId}`, ['postsCount', `${count}`])

      await multi.exec()
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}
