import Logger from 'bunyan'
import { remove } from 'lodash'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { IBlockedUserJob } from '@follower/interfaces/follower.interface'

const log: Logger = config.createLogger('userBlockCache')

export class UserBlockCache extends BaseCache {
  constructor() {
    super('userBlockCache')
  }

  /**
   * update
   */
  public async update(blockedUser: IBlockedUserJob, prop: string): Promise<void> {
    const { type, userId, followeeId } = blockedUser
    try {
      if (!this.client.isOpen) await this.client.connect()

      const props: string = (await this.client.HGET(`users:${userId}`, prop)) as string
      let blocked: string[] = Utils.parseJson(props) as string[]
      if (type === 'block') blocked.push(followeeId!)
      else blocked = [...remove(blocked, (id: string) => id === followeeId)]

      await this.client.HSET(`users:${userId}`, prop, JSON.stringify(blocked))
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}
