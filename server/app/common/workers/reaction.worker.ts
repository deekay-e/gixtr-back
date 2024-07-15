import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { reactionService } from '@service/db/reaction.service'

const log: Logger = config.createLogger('reactionWorker')

class ReactionWorker {
  async addReaction(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await reactionService.addReaction(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async removeReaction(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await reactionService.removeReaction(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker()
