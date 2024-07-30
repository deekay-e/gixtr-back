import { ObjectId } from 'mongodb'
import { mongo, Query } from 'mongoose'

import {
  IFollowerData,
  IFollowerDocument,
  IFollowerJob
} from '@follower/interfaces/follower.interface'
import { UserModel } from '@user/models/user.model'
import { mailQueue } from '@service/queues/mail.queue'
import { FollowerModel } from '@follower/models/follower.model'
import { IUserDocument } from '@user/interfaces/user.interface'
import { socketIONotificationObject } from '@socket/notification'
import { NotificationModel } from '@notification/models/notification.model'
import { notification } from '@service/email/templates/notification/template'
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface'
import {
  INotificationDocument,
  INotificationTemplate
} from '@notification/interfaces/notification.interface'

class FollowService {
  public async addFollower(follow: IFollowerJob): Promise<void> {
    const { userId, username, followeeId, followerDocumentId } = follow
    const userObjectId: ObjectId = new ObjectId(userId)
    const followeeObjectId: ObjectId = new ObjectId(followeeId)

    const following = await FollowerModel.create({
      _id: followerDocumentId,
      followerId: userObjectId,
      followeeId: followeeObjectId
    })

    const users: Promise<mongo.BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ])

    const res: [mongo.BulkWriteResult, IUserDocument | null] = await Promise.all([
      users,
      UserModel.findOne({ _id: followeeId })
    ])

    // send notifications here
    if (res[1]?.notifications.follows && userId !== followeeId) {
      const notificationModel: INotificationDocument = new NotificationModel()
      const notifications = await notificationModel.insertNotification({
        userFrom: userId!,
        userTo: followeeId!,
        message: `${username} followed you`,
        type: 'follow',
        entityId: new ObjectId(userId),
        createdItemId: new ObjectId(following._id),
        createdAt: new Date(),
        comment: '',
        post: '',
        imgId: '',
        imgVersion: '',
        gifUrl: '',
        reaction: ''
      })

      // send to client via socketIO
      socketIONotificationObject.emit('new follower', notifications, { followeeId })

      // send to email queue
      const templateData: INotificationTemplate = {
        username: res[1].username!,
        message: `${username} followed you`,
        header: 'Follower Notification'
      }
      const template: string = notification.render(templateData)
      mailQueue.addMailJob('followNotification', {
        receiver: res[1].email!,
        template,
        subject: 'New follower notification'
      })
    }
  }

  public async getFollowers(key: string): Promise<IFollowerData[]> {
    const followers: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followeeId: new ObjectId(key) } },
      { $lookup: { from: 'users', localField: 'followerId', foreignField: '_id', as: 'follower' } },
      { $unwind: '$follower' },
      { $lookup: { from: 'auth', localField: `follower.authId`, foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      {
        $addFields: this.getFields('follower')
      },
      { $project: this.getProjection() }
    ])
    return followers
  }

  public async getFollowees(key: string): Promise<IFollowerData[]> {
    const followees: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followerId: new ObjectId(key) } },
      { $lookup: { from: 'users', localField: 'followeeId', foreignField: '_id', as: 'followee' } },
      { $unwind: '$followee' },
      { $lookup: { from: 'auth', localField: `followee.authId`, foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      {
        $addFields: this.getFields('followee')
      },
      { $project: this.getProjection() }
    ])
    return followees
  }

  public async removeFollower(follow: IFollowerJob): Promise<void> {
    const { userId, followeeId } = follow

    const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> =
      FollowerModel.deleteOne({
        followeeId,
        followerId: userId
      })

    const users: Promise<mongo.BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      }
    ])

    await Promise.all([unfollow, users])
  }

  private getProjection() {
    return {
      auth: 0,
      followee: 0,
      follower: 0,
      followeeId: 0,
      followerId: 0,
      createdAt: 0,
      __v: 0
    }
  }

  private getFields(key: string) {
    return {
      _id: `$${key}._id`,
      uId: `$auth.uId`,
      userProfile: `$${key}`,
      username: `$auth.username`,
      postCount: `$${key}.postCount`,
      avatarColor: `$auth.avatarColor`,
      followersCount: `$${key}.followersCount`,
      followingCount: `$${key}.followingCount`,
      profilePicture: `$${key}.profilePicture`
    }
  }
}

export const followService: FollowService = new FollowService()
