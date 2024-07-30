import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIONotificationObject } from '@socket/notification'
import { notificationQueue } from '@service/queues/notification.queue'
import { INotificationJob } from '@notification/interfaces/notification.interface'

export class NotificationUpdate {
  public async init(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params

    // emit socket event for notification object
    socketIONotificationObject.emit('update notification', notificationId)

    // update notification data in databse
    const notificationJob: INotificationJob = { key: notificationId }
    notificationQueue.addNotificationJob('updateNotification', notificationJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' })
  }
}
