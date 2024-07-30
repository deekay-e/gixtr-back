import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { notificationQueue } from '@service/queues/notification.queue'
import { INotificationJob } from '@notification/interfaces/notification.interface'

export class NotificationUpdate {
  public async init(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params

    // update notification data in databse
    const notificationJob: INotificationJob = { key: notificationId }
    notificationQueue.addNotificationJob('updateNotification', notificationJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Notification update successful' })
  }
}
