import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { followService } from '@service/db/follow.service'

const log: Logger = config.createLogger('followWorker')

class FollowWorker {
  async addFollower(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await followService.addFollower(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async removeFollower(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await followService.removeFollower(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const followWorker: FollowWorker = new FollowWorker()
