import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { postService } from '@service/db/post.service'

const log: Logger = config.createLogger('postWorker')

class PostWorker {
  async addPostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await postService.createPost(key, value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async updatePost(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await postService.updatePost(key, value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async deletePost(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data
      await postService.deletePost(keyOne, keyTwo)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const postWorker: PostWorker = new PostWorker()
