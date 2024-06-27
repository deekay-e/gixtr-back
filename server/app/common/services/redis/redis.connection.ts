import Logger from 'bunyan'

import { config } from '@/config'
import { BaseCache } from '@service/redis/base.cache'

const log: Logger = config.createLogger('redis')

class RedisConnection extends BaseCache {
  constructor() {
    super('redis')
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect()
      const ping = await this.client.ping()
      log.info(`Redis connection ping: ${ping}`)
    } catch (error) {
      log.error(error)
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection()
