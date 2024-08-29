import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { userService } from '@service/db/user.service'
import { authService } from '@service/db/auth.service'

const log: Logger = config.createLogger('userWorker')

class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data
      await userService.createUser(value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async updateUserInfo(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await userService.updateUserInfo(key, value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async updateRoles(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data
      await authService.updateRoles(value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async updateSocials(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await userService.updateSocials(key, value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async updateNotifications(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await userService.editNotificationSettings(key, value)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const userWorker: UserWorker = new UserWorker()
