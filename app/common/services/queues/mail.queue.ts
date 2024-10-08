import { mailWorker } from '@worker/mail.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IMailJob } from '@user/interfaces/user.interface'

class MailQueue extends BaseQueue {
  constructor() {
    super('mail')

    this.processJob('resetPassword', 5, mailWorker.deliverEmail)
    this.processJob('changePassword', 5, mailWorker.deliverEmail)
    this.processJob('forgotPassword', 5, mailWorker.deliverEmail)
    this.processJob('reactionPassword', 5, mailWorker.deliverEmail)
    this.processJob('followNotification', 5, mailWorker.deliverEmail)
    this.processJob('commentNotification', 5, mailWorker.deliverEmail)
  }

  public addMailJob(name: string, data: IMailJob): void {
    this.addJob(name, data)
  }
}

export const mailQueue: MailQueue = new MailQueue()
