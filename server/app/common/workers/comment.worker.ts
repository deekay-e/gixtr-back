import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { commentService } from '@service/db/comment.service'

const log: Logger = config.createLogger('commentWorker')

class CommentWorker {
  async addComment(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await commentService.addComment(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async deleteComment(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await commentService.deleteComment(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker()
