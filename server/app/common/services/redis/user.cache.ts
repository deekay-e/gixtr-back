import Logger from 'bunyan'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface'

const log: Logger = config.createLogger('userCache')

type UserProp = string | ISocialLinks | INotificationSettings
type UserCacheMultiType =
  | string
  | number
  | Buffer
  | RedisCommandRawReply
  | IUserDocument
  | IUserDocument[]

export class UserCache extends BaseCache {
  constructor() {
    super('userCache')
  }

  /**
   * addUser
   */
  public async addUser(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date()
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser
    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    }

    try {
      if (!this.client.isOpen) await this.client.connect()
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` })
      for (const [itemKey, itemValue] of Object.entries(dataToSave))
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getUser
   */
  public async getUser(key: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const res: IUserDocument = (await this.client.HGETALL(
        `users:${key}`
      )) as unknown as IUserDocument
      res.createdAt = new Date(Utils.parseJson(`${res.createdAt}`))
      res.postsCount = Utils.parseJson(`${res.postsCount}`)
      res.blocked = Utils.parseJson(`${res.blocked}`)
      res.blockedBy = Utils.parseJson(`${res.blockedBy}`)
      res.notifications = Utils.parseJson(`${res.notifications}`)
      res.social = Utils.parseJson(`${res.social}`)
      res.followersCount = Utils.parseJson(`${res.followersCount}`)
      res.followingCount = Utils.parseJson(`${res.followingCount}`)
      res.bgImageId = Utils.parseJson(`${res.bgImageId}`)
      res.bgImageVersion = Utils.parseJson(`${res.bgImageVersion}`)
      res.profilePicture = Utils.parseJson(`${res.profilePicture}`)

      return res
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getUsers
   */
  public async getUsers(key: string, start: number, end: number): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const res: string[] = await this.client.ZRANGE('user', start, end, { REV: true })
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      for (const score of res) if (score !== key) multi.HGETALL(`users:${score}`)

      const replies: UserCacheMultiType = (await multi.exec()) as UserCacheMultiType
      const userReplies: IUserDocument[] = []
      for (const reply of replies as IUserDocument[]) {
        reply.createdAt = new Date(Utils.parseJson(`${reply.createdAt}`))
        reply.postsCount = Utils.parseJson(`${reply.postsCount}`)
        reply.blocked = Utils.parseJson(`${reply.blocked}`)
        reply.blockedBy = Utils.parseJson(`${reply.blockedBy}`)
        reply.notifications = Utils.parseJson(`${reply.notifications}`)
        reply.social = Utils.parseJson(`${reply.social}`)
        reply.followersCount = Utils.parseJson(`${reply.followersCount}`)
        reply.followingCount = Utils.parseJson(`${reply.followingCount}`)
        reply.bgImageId = Utils.parseJson(`${reply.bgImageId}`)
        reply.bgImageVersion = Utils.parseJson(`${reply.bgImageVersion}`)
        reply.profilePicture = Utils.parseJson(`${reply.profilePicture}`)

        userReplies.push(reply)
      }

      return userReplies
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getUser
   */
  public async updateUserProp(
    key: string,
    prop: string,
    value: UserProp
  ): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      await this.client.HSET(`users:${key}`, prop, JSON.stringify(value))
      const user: IUserDocument = (await this.getUser(key)) as IUserDocument

      return user
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getUsersCount
   */
  public async getUsersCount(): Promise<number> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const userCount: number = await this.client.ZCARD('user')
      return userCount
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}
