import { Request, Response } from 'express'

import { existingUser } from '@mock/user.mock'
import { authUserPayload } from '@mock/auth.mock'
import { FollowCache } from '@service/redis/follow.cache'
import { followQueue } from '@service/queues/follow.queue'
import { UnfollowUser } from '@follower/controllers/unfollow-user'
import { followersMockRequest, followersMockResponse } from '@mock/follow.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/follower.cache')

describe('UnfollowUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response', async () => {
    const req: Request = followersMockRequest({}, authUserPayload, {
      followerId: '6064861bc25eaa5a5d2f9bf4',
      followeeId: `${existingUser._id}`
    }) as Request
    const res: Response = followersMockResponse()
    jest.spyOn(FollowCache.prototype, 'removeFollower')
    jest.spyOn(FollowCache.prototype, 'updateFollowerCount')
    jest.spyOn(followQueue, 'addFollowerJob')

    await UnfollowUser.prototype.remove(req, res)
    expect(FollowCache.prototype.removeFollower).toHaveBeenCalledTimes(2)
    expect(FollowCache.prototype.removeFollower).toHaveBeenCalledWith(
      `following:${req.currentUser!.userId}`,
      req.params.followeeId
    )
    expect(FollowCache.prototype.removeFollower).toHaveBeenCalledWith(
      `followers:${req.params.followeeId}`,
      req.params.followerId
    )
    expect(FollowCache.prototype.updateFollowerCount).toHaveBeenCalledTimes(2)
    expect(FollowCache.prototype.updateFollowerCount).toHaveBeenCalledWith(
      `${req.params.followeeId}`,
      'followersCount',
      -1
    )
    expect(FollowCache.prototype.updateFollowerCount).toHaveBeenCalledWith(
      `${req.params.followerId}`,
      'followingCount',
      -1
    )
    expect(followQueue.addFollowerJob).toHaveBeenCalledWith('removeFollower', {
      followeeId: `${req.params.followeeId}`,
      userId: `${req.currentUser!.userId}`
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unfollow user successful'
    })
  })
})
