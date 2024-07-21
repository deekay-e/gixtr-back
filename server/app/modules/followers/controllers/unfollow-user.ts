import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { FollowCache } from '@service/redis/follow.cache'
import { followQueue } from '@service/queues/follow.queue'
import { IFollowerJob } from '@follower/interfaces/follower.interface'

const followCache: FollowCache = new FollowCache()

export class UnfollowUser {
  public async remove(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params
    const followerId: string = req.currentUser!.userId

    // remove following data from cache and
    // update the followee and follower counts for given users
    await Promise.all([
      followCache.removeFollower(`followers:${followerId}`, followeeId),
      followCache.removeFollower(`following:${followeeId}`, followerId),
      followCache.updateFollowerCount(followeeId, 'followersCount', -1),
      followCache.updateFollowerCount(followerId, 'followingCount', -1)
    ])

    // send data to queue
    const follow: IFollowerJob = { followeeId, userId: followerId } as IFollowerJob
    followQueue.addFollowerJob('removeFollow', follow)

    res.status(HTTP_STATUS.OK).json({ message: `Unfollow user successful` })
  }
}
