import Logger from 'bunyan'
import { ObjectId } from 'mongodb'

import { config } from '@/config'
import { UserCache } from './user.cache'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { IUserDocument } from '@user/interfaces/user.interface'
import { IFollowerData } from '@follower/interfaces/follower.interface'

const userCache: UserCache = new UserCache()
const log: Logger = config.createLogger('followCache')

export class FollowCache extends BaseCache {
  constructor() {
    super('followCache')
  }

  /**
   * addFollower
   */
  public async addFollower(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      await this.client.LPUSH(key, value)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getFollows
   */
  public async getFollows(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const follows: IFollowerData[] = []
      const cacheFollows: string[] = await this.client.LRANGE(key, 0, -1)
      for (const item in cacheFollows) {
        const user: IUserDocument = (await userCache.getUser(item)) as IUserDocument
        const follow: IFollowerData = this.getFollowerData(user)
        if (follow.uId) follows.push(follow)
      }
      return follows
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * removeFollower
   */
  public async removeFollower(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      await this.client.LREM(key, 1, value)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * updateFollowerCount
   */
  public async updateFollowerCount(key: string, prop: string, value: number): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      await this.client.HINCRBY(`users:${key}`, prop, value)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  private getFollowerData(user: IUserDocument): IFollowerData {
    return {
      uId: user.uId!,
      userProfile: user,
      username: user.username!,
      postCount: user.postsCount,
      _id: new ObjectId(user._id),
      avatarColor: user.avatarColor!,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture
    }
  }
}
