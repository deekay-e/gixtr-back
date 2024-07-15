import Logger from 'bunyan'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { IUserDocument } from '@user/interfaces/user.interface'

const log: Logger = config.createLogger('userCache')

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

      return res
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}
