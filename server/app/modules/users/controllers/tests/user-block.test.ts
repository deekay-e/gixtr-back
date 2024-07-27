import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import { UserBlock } from '@user/controllers/user-block'
import { UserBlockCache } from '@service/redis/user-block.cache'
import { userBlockQueue } from '@service/queues/user-block.queue'
import { followersMockRequest, followersMockResponse } from '@mock/follow.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/follower.cache')

describe('UserBlock', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('block', () => {
    it('should send correct json response', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followerId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(UserBlockCache.prototype, 'update')
      jest.spyOn(userBlockQueue, 'addUserBlockJob')

      await UserBlock.prototype.block(req, res)
      expect(UserBlockCache.prototype.update).toHaveBeenCalledWith(
        '6064861bc25eaa5a5d2f9bf4',
        'blockedBy',
        `${req.currentUser?.userId}`,
        'block'
      )
      expect(UserBlockCache.prototype.update).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        'blocked',
        '6064861bc25eaa5a5d2f9bf4',
        'block'
      )
      expect(userBlockQueue.addUserBlockJob).toHaveBeenCalledWith('blockUser', {
        userId: `${req.currentUser?.userId}`,
        followeeId: '6064861bc25eaa5a5d2f9bf4',
        type: 'block'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Block user successful'
      })
    })
  })

  describe('unblock', () => {
    it('should send correct json response', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followerId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(UserBlockCache.prototype, 'update')
      jest.spyOn(userBlockQueue, 'addUserBlockJob')

      await UserBlock.prototype.unblock(req, res)
      expect(UserBlockCache.prototype.update).toHaveBeenCalledWith(
        '6064861bc25eaa5a5d2f9bf4',
        'blockedBy',
        `${req.currentUser?.userId}`,
        'unblock'
      )
      expect(UserBlockCache.prototype.update).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        'blocked',
        '6064861bc25eaa5a5d2f9bf4',
        'unblock'
      )
      expect(userBlockQueue.addUserBlockJob).toHaveBeenCalledWith('unblockUser', {
        userId: `${req.currentUser?.userId}`,
        followeeId: '6064861bc25eaa5a5d2f9bf4',
        type: 'unblock'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unblock user successful'
      })
    })
  })
})
