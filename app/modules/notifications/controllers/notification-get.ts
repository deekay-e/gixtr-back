import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { notification } from '@service/db/notification.service'
import { INotificationDocument } from '@notification/interfaces/notification.interface'

export class NotificationGet {
  public async many(req: Request, res: Response): Promise<void> {
    const { userId } = req.params

    // get notification data from database
    const notifications: INotificationDocument[] = await notification.getNotifications(userId)

    res.status(HTTP_STATUS.OK).json({
      message: 'Get notifications successful',
      notifications
    })
  }
}
