import Logger from 'bunyan'
import { filter } from 'lodash'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface'

const log: Logger = config.createLogger('postCache')

export type PostCacheMultiType =
  | string
  | number
  | Buffer
  | RedisCommandRawReply
  | IPostDocument
  | IPostDocument[]

export class PostCache extends BaseCache {
  constructor() {
    super('postCache')
  }

  /**
   * addPost
   */
  public async addPost(data: ISavePostToCache): Promise<void> {
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
      for (const [itemKey, itemValue] of Object.entries(dataToSave))
        await this.client.HSET(`posts:${key}`, itemKey, itemValue)

      const count: number = parseInt(postsCount[0], 10) + 1
      multi.HSET(`users:${currentUserId}`, 'postsCount', count)

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

      const post: IPostDocument[] = (await this.client.HGETALL(
        `posts:${key}`
      )) as unknown as IPostDocument[]
      post[0].createdAt = new Date(Utils.parseJson(`${post[0].createdAt}`))
      post[0].commentsCount = Utils.parseJson(`${post[0].commentsCount}`)
      post[0].reactions = Utils.parseJson(`${post[0].reactions}`)

      return post[0]
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
      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType
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
  public async getPostsWithImages(
    key: string,
    start: number,
    end: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true })
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      for (const score of reply) multi.HGETALL(`posts:${score}`)

      const posts: IPostDocument[] = []
      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType
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
  public async getUserPosts(
    key: string,
    uId: number,
    start: number,
    end: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const res: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' })
      const filteredPosts: string[] = filter(res, (key, index) => index >= start && index < end)
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      for (const score of filteredPosts) multi.HGETALL(`posts:${score}`)

      const posts: IPostDocument[] = []
      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType
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
   * updatePost
   *
   * @key - the post _id
   * @post - the updated post data
   */
  public async updatePost(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const { post, bgColor, feelings, gifUrl, imgVersion, imgId, profilePicture, scope } =
        updatedPost
      const dataToSave = {
        post: `${post}`,
        bgColor: `${bgColor}`,
        feelings: `${feelings}`,
        gifUrl: `${gifUrl}`,
        imgVersion: `${imgVersion}`,
        imgId: `${imgId}`,
        profilePicture: `${profilePicture}`,
        scope: `${scope}`
      }

      for (const [itemKey, itemValue] of Object.entries(dataToSave))
        await this.client.HSET(`posts:${key}`, itemKey, itemValue)
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      multi.HGETALL(`posts:${key}`)
      const reply: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType
      const posts = reply as IPostDocument[]
      posts[0].createdAt = new Date(Utils.parseJson(`${posts[0].createdAt}`))
      posts[0].commentsCount = Utils.parseJson(`${posts[0].commentsCount}`)
      posts[0].reactions = Utils.parseJson(`${posts[0].reactions}`)

      return posts[0]
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
      multi.HSET(`users:${userId}`, 'postsCount', count)

      await multi.exec()
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}
