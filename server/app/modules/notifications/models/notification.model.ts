import Logger from 'bunyan'
import { ObjectId } from 'mongodb'
import { model, Model, Schema } from 'mongoose'

import { config } from '@/config'
import { ServerError } from '@global/helpers/error-handler'
import { notification } from '@service/db/notification.service'
import {
  INotification,
  INotificationDocument
} from '@notification/interfaces/notification.interface'

const log: Logger = config.createLogger('notification')

const notificationSchema: Schema = new Schema({
  userTo: { type: ObjectId, ref: 'User', index: true },
  userFrom: { type: ObjectId, ref: 'User' },
  message: { type: String, default: '' },
  type: { type: String, default: '' },
  entityId: ObjectId,
  createdItemId: ObjectId,
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now() }
})

notificationSchema.methods.insertNotification = async function (body: INotification) {
  const { userTo } = body

  await NotificationModel.create(body)
  try {
    const notifications: INotificationDocument[] = await notification.getNotifications(userTo)
    return notifications
  } catch (error) {
    log.error(error)
    throw new ServerError('Server error. Try again.')
  }
}

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>(
  'Notification',
  notificationSchema,
  'notifications'
)
export { NotificationModel }
