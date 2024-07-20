import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIOFollowObject } from '@socket/follow'
import { UserCache } from '@service/redis/user.cache'
import { FollowCache } from '@service/redis/follow.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import { IFollowerData, IFollowerJob } from '@follower/interfaces/follower.interface'
import { followQueue } from '@service/queues/follow.queue'

const userCache: UserCache = new UserCache()
const followCache: FollowCache = new FollowCache()

export class FollowUser {
  public async add(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params
    const followerId: string = req.currentUser!.userId

    // update the followee and follower counts for given followee
    await Promise.all([
      followCache.updateFollowerCount(followeeId, 'followersCount', 1),
      followCache.updateFollowerCount(followerId, 'followingCount', 1)
    ])

    // get follower and followee users from redis
    const users: [IUserDocument, IUserDocument] = (await Promise.all([
      userCache.getUser(followeeId),
      userCache.getUser(followerId)
    ])) as [IUserDocument, IUserDocument]

    const newFollowerId: ObjectId = new ObjectId()
    const followeeData: IFollowerData = FollowUser.prototype.getFollowerData(users[0])
    socketIOFollowObject.emit('add follower', followeeData)

    // add following data to cache
    await Promise.all([
      followCache.addFollower(`followers:${followerId}`, followeeId),
      followCache.addFollower(`following:${followeeId}`, followerId)
    ])

    // send data to queue
    const follow: IFollowerJob = {
      followeeId,
      userId: followerId,
      followerDocumentId: newFollowerId,
      username: req.currentUser!.username
    } as IFollowerJob
    followQueue.addFollowerJob('addFollower', follow)

    res.status(HTTP_STATUS.CREATED).json({ message: `Follow user ${users[0].username} successful` })
  }

  private getFollowerData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    }
  }
}
