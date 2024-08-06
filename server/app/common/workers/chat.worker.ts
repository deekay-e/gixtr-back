import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'

import { config } from '@/config'
import { chatService } from '@service/db/chat.service'

const log: Logger = config.createLogger('chatWorker')

class ChatWorker {
  async addMessage(job: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.addMessage(job.data)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async markMessageAsDeleted(job: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.markMessageAsDeleted(job.data)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  async markMessagesAsRead(job: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.markMessagesAsRead(job.data)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker()
