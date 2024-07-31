import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { image } from '@service/db/image.service'

const log: Logger = config.createLogger('imageWorker')

class ImageWorker {
  async addImage(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await image.addImage(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async addProfilePicture(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await image.addProfilePicture(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async addBackgroundPicture(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await image.addBackgroundPicture(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async removeImage(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await image.removeImage(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const imageWorker: ImageWorker = new ImageWorker()
