import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { notificationQueue } from '@service/queues/notification.queue'
import { INotificationJob } from '@notification/interfaces/notification.interface'

export class NotificationDelete {
  public async init(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params

    // delete notification data from databse
    const query: INotificationJob = {
      key:  notificationId
    } as INotificationJob
    notificationQueue.addNotificationJob('deleteNotification', query)

    res.status(HTTP_STATUS.OK).json({ message: 'Delete notification successful' })
  }
}
