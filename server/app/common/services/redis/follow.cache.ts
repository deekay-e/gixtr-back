import Logger from 'bunyan'

import { config } from '@/config'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'

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
}
