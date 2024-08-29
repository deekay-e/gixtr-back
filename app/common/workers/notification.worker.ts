import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { notification } from '@service/db/notification.service'

const log: Logger = config.createLogger('userWorker')

class NotificationWorker {
  async update(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await notification.updateNotification(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async delete(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await notification.deleteNotification(data)

      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker()
