import { mailWorker } from '@worker/mail.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IMailJob } from '@user/interfaces/user.interface'


class MailQueue extends BaseQueue {
  constructor() {
    super('mail')

    this.processJob('forgotPasswordMail', 5, mailWorker.deliverEmail)
  }

  public addMailJob(name: string, data: IMailJob): void {
    this.addJob(name, data)
  }
}

export const mailQueue: MailQueue = new MailQueue()
