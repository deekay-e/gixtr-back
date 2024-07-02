import Logger from 'bunyan'
import { DoneCallback, Job } from 'bull'


import { config } from '@/config'
import { mailTransport } from '@service/email/mail.transport'

const log: Logger = config.createLogger('mailWorker')

class MailWorker {
  async deliverEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await mailTransport.sendEmail(data)

      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const mailWorker: MailWorker = new MailWorker()
