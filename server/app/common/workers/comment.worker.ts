import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { commentService } from '@service/db/comment.service'
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface'

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

  async getComment(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { postId, username } = job.data
      await commentService.getComment(postId, username)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async getComments(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { query, sort } = job.data
      await commentService.getComments(query, sort)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async getCommentsNames(job: Job, done: DoneCallback): Promise<ICommentNameList[] | undefined> {
    try {
      const { data } = job
      const comments: ICommentNameList[] = await commentService.getCommentsNames(data)

      job.progress(100)
      done(null, comments)
      return comments
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
