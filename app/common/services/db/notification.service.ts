import { ObjectId } from 'mongodb'

import {
  INotificationDocument,
  INotificationJob
} from '@notification/interfaces/notification.interface'
import { NotificationModel } from '@notification/models/notification.model'

class NotificationService {
  /**
   * getNotifications
   */
  public async getNotifications(userId: string): Promise<INotificationDocument[]> {
    const notifications = await NotificationModel.aggregate([
      { $match: { userTo: new ObjectId(userId) } },
      { $lookup: { from: 'users', localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
      { $unwind: '$userFrom' },
      { $lookup: { from: 'auth', localField: 'userFrom.authId', foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      {
        $project: {
          _id: 1,
          message: 1,
          type: 1,
          entityId: 1,
          createdItemId: 1,
          createdAt: 1,
          comment: 1,
          reaction: 1,
          post: 1,
          imgId: 1,
          imgVersion: 1,
          gifUrl: 1,
          userTo: 1,
          userFrom: {
            profilePicture: '$userFrom.profilePicture',
            username: '$auth.profilePicture',
            avatarColor: '$auth.profilePicture',
            uId: '$auth.profilePicture'
          }
        }
      }
    ])

    return notifications
  }

  /**
   * updateNotification
   */
  public async updateNotification(data: INotificationJob): Promise<void> {
    const { key } = data
    await NotificationModel.updateOne({ _id: key }, { $set: { read: true } }).exec()
  }

  /**
   * deleteNotification
   */
  public async deleteNotification(data: INotificationJob): Promise<void> {
    const { key } = data
    await NotificationModel.deleteOne({ _id: key }).exec()
  }
}

export const notification: NotificationService = new NotificationService()
