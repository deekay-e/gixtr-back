import { ObjectId } from 'mongodb'
import { mongo, Query } from 'mongoose'

import { UserModel } from '@user/models/user.model'
import { FollowerModel } from '@follower/models/follower.model'
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface'
import { IFollowerDocument, IFollowerJob } from '@follower/interfaces/follower.interface'

class FollowService {
  public async addFollower(follow: IFollowerJob): Promise<void> {
    const { userId, username, followeeId, followerDocumentId } = follow
    const userObjectId: ObjectId = new ObjectId(userId)
    const followeeObjectId: ObjectId = new ObjectId(followeeId)

    await FollowerModel.create({
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

    await Promise.all([users, UserModel.findOne({ _id: followeeId })])
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
}

export const followService: FollowService = new FollowService()
