import { BaseQueue } from '@service/queues/base.queue'
import { notificationWorker } from '@worker/notification.worker'
import { INotificationJob } from '@notification/interfaces/notification.interface'

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notification')

    this.processJob('updateNotification', 5, notificationWorker.update)
    this.processJob('deleteNotification', 5, notificationWorker.delete)
  }

  public addNotificationJob(name: string, data: INotificationJob): void {
    this.addJob(name, data)
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue()
