import Logger from 'bunyan'
import { filter } from 'lodash'

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
      email,
      blocked,
      username,
      blockedBy,
      postsCount,
      avatarColor,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      bgImageVersion,
      bgImageId,
      location,
      school,
      social,
      quote,
      work
    } = createdUser
    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      email: `${email}`,
      username: `${username}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      avatarColor: `${avatarColor}`,
      blocked: JSON.stringify(blocked),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      blockedBy: JSON.stringify(blockedBy),
      notifications: JSON.stringify(notifications),
      bgImageVersion: `${bgImageVersion}`,
      social: JSON.stringify(social),
      bgImageId: `${bgImageId}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      work: `${work}`
    }

    try {
      if (!this.client.isOpen) await this.client.connect()
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: key })
      for (const [itemKey, itemValue] of Object.entries(dataToSave))
        await this.client.HSET(`users:${key}`, itemKey, itemValue)
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
      res.social = Utils.parseJson(`${res.social}`)
      res.blocked = Utils.parseJson(`${res.blocked}`)
      res.bgImageId = Utils.parseJson(`${res.bgImageId}`)
      res.blockedBy = Utils.parseJson(`${res.blockedBy}`)
      res.postsCount = Utils.parseJson(`${res.postsCount}`)
      res.notifications = Utils.parseJson(`${res.notifications}`)
      res.createdAt = new Date(Utils.parseJson(`${res.createdAt}`))
      res.followersCount = Utils.parseJson(`${res.followersCount}`)
      res.followingCount = Utils.parseJson(`${res.followingCount}`)
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
        reply.social = Utils.parseJson(`${reply.social}`)
        reply.blocked = Utils.parseJson(`${reply.blocked}`)
        reply.blockedBy = Utils.parseJson(`${reply.blockedBy}`)
        reply.bgImageId = Utils.parseJson(`${reply.bgImageId}`)
        reply.postsCount = Utils.parseJson(`${reply.postsCount}`)
        reply.notifications = Utils.parseJson(`${reply.notifications}`)
        reply.followersCount = Utils.parseJson(`${reply.followersCount}`)
        reply.followingCount = Utils.parseJson(`${reply.followingCount}`)
        reply.bgImageVersion = Utils.parseJson(`${reply.bgImageVersion}`)
        reply.profilePicture = Utils.parseJson(`${reply.profilePicture}`)
        reply.createdAt = new Date(Utils.parseJson(`${reply.createdAt}`))

        userReplies.push(reply)
      }

      return userReplies
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getRandomUsers
   */
  public async getRandomUsers(key: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const userReplies: IUserDocument[] = []
      const users: string[] = await this.client.ZRANGE('user', 0, -1)
      const followers: string[] = await this.client.LRANGE(`followers:${key}`, 0, -1)
      const filteredUsers = filter(users, (user) => !followers.includes(user) && user !== key)
      const randomUsers: string[] = Utils.shuffle(filteredUsers).slice(0, 10)
      for (const user of randomUsers) {
        const userHash: IUserDocument = (await this.client.HGETALL(
          `users:${user}`
        )) as unknown as IUserDocument
        userReplies.push(userHash)
      }

      for (const reply of userReplies) {
        reply.social = Utils.parseJson(`${reply.social}`)
        reply.blocked = Utils.parseJson(`${reply.blocked}`)
        reply.bgImageId = Utils.parseJson(`${reply.bgImageId}`)
        reply.blockedBy = Utils.parseJson(`${reply.blockedBy}`)
        reply.postsCount = Utils.parseJson(`${reply.postsCount}`)
        reply.notifications = Utils.parseJson(`${reply.notifications}`)
        reply.createdAt = new Date(Utils.parseJson(`${reply.createdAt}`))
        reply.followersCount = Utils.parseJson(`${reply.followersCount}`)
        reply.followingCount = Utils.parseJson(`${reply.followingCount}`)
        reply.bgImageVersion = Utils.parseJson(`${reply.bgImageVersion}`)
        reply.profilePicture = Utils.parseJson(`${reply.profilePicture}`)
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
