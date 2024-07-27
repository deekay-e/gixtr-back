import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as followServer from '@socket/follow'
import { existingUser } from '@mock/user.mock'
import { authUserPayload } from '@mock/auth.mock'
import { UserCache } from '@service/redis/user.cache'
import { FollowCache } from '@service/redis/follow.cache'
import { followQueue } from '@service/queues/follow.queue'
import { FollowUser } from '@follower/controllers/follow-user'
import { followersMockRequest, followersMockResponse } from '@mock/follow.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/user.cache')
jest.mock('@service/redis/follower.cache')

Object.defineProperties(followServer, {
  socketIOFollowerObject: {
    value: new Server(),
    writable: true
  }
})

describe('FollowUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('follower', () => {
    it('should call updateFollowerCount', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followerId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(FollowCache.prototype, 'updateFollowerCount')
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUser)

      await FollowUser.prototype.add(req, res)
      expect(FollowCache.prototype.updateFollowerCount).toHaveBeenCalledTimes(2)
      expect(FollowCache.prototype.updateFollowerCount).toHaveBeenCalledWith(
        '6064861bc25eaa5a5d2f9bf4',
        'followersCount',
        1
      )
      expect(FollowCache.prototype.updateFollowerCount).toHaveBeenCalledWith(
        `${existingUser._id}`,
        'followingCount',
        1
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: `Follow user ${existingUser.username} successful`
      })
    })

    it('should call addFollower', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followerId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(followServer.socketIOFollowObject, 'emit')
      jest.spyOn(FollowCache.prototype, 'addFollower')
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUser)

      await FollowUser.prototype.add(req, res)
      expect(UserCache.prototype.getUser).toHaveBeenCalledTimes(2)
      expect(FollowCache.prototype.addFollower).toHaveBeenCalledTimes(2)
      expect(FollowCache.prototype.addFollower).toHaveBeenCalledWith(
        `following:${req.currentUser!.userId}`,
        '6064861bc25eaa5a5d2f9bf4'
      )
      expect(FollowCache.prototype.addFollower).toHaveBeenCalledWith(
        'followers:6064861bc25eaa5a5d2f9bf4',
        `${existingUser._id}`
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: `Follow user ${existingUser.username} successful`
      })
    })

    it('should call followQueue addFollowerJob', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followeeId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request
      const res: Response = followersMockResponse()
      const spy = jest.spyOn(followQueue, 'addFollowerJob')

      await FollowUser.prototype.add(req, res)
      expect(followQueue.addFollowerJob).toHaveBeenCalledWith('addFollowerToDB', {
        userId: `${req.currentUser?.userId}`,
        followeeId: '6064861bc25eaa5a5d2f9bf4',
        username: req.currentUser!.username,
        followerDocumentId: spy.mock.calls[0][1].followerDocumentId
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: `Follow user ${existingUser.username} successful`
      })
    })
  })
})
