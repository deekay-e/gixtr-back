import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { userBlock } from '@service/db/user-block.service'

const log: Logger = config.createLogger('userWorker')

class UserBlockWorker {
  async block(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await userBlock.block(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async unblock(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await userBlock.unblock(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const userBlockWorker: UserBlockWorker = new UserBlockWorker()
