import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { UserCache } from '@service/redis/user.cache'
import { FollowCache } from '@service/redis/follow.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import { IFollowerData } from '@follower/interfaces/follower.interface'
import { socketIOFollowObject } from '@socket/follow'

const userCache: UserCache = new UserCache()
const followCache: FollowCache = new FollowCache()

export class FollowUser {
  public async add(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params
    const followeeId: string = req.currentUser!.userId

    await Promise.all([
      followCache.updateFollowerCount(followerId, 'followersCount', 1),
      followCache.updateFollowerCount(followeeId, 'followingCount', 1)
    ])

    // get follower and follower from redis
    const users: [IUserDocument, IUserDocument] = await Promise.all([
      userCache.getUser(followerId),
      userCache.getUser(followeeId)
    ]) as [IUserDocument, IUserDocument]

    const newFollowerId: ObjectId = new ObjectId()
    const followeeData: IFollowerData = FollowUser.prototype.getFollowerData(users[0])
    socketIOFollowObject.emit('add follower', followeeData)

    await Promise.all([
      followCache.addFollower(`followers:${followeeId}`, followerId),
      followCache.addFollower(`following:${followerId}`, followeeId)
    ])

    // send data to queue

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
