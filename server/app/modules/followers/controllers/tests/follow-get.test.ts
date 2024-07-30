import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { authUserPayload } from '@mock/auth.mock'
import { existingUserTwo } from '@mock/user.mock'
import { FollowCache } from '@service/redis/follow.cache'
import { followService } from '@service/db/follow.service'
import { FollowGet } from '@follower/controllers/follow-get'
import { followersMockRequest, followersMockResponse, mockFollowerData } from '@mock/follow.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/follower.cache')

describe('FollowGet', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('userFollowing', () => {
    it('should send correct json response if user following exist in cache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([mockFollowerData])

      await FollowGet.prototype.followees(req, res)
      expect(FollowCache.prototype.getFollows).toBeCalledWith(
        `following:${req.currentUser?.userId}`
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user following successful',
        followees: [mockFollowerData]
      })
    })

    it('should send correct json response if user following exist in database', async () => {
      const req: Request = followersMockRequest({}, authUserPayload) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([])
      jest.spyOn(followService, 'getFollowees').mockResolvedValue([mockFollowerData])

      await FollowGet.prototype.followees(req, res)
      expect(followService.getFollowees).toHaveBeenCalledWith(new ObjectId(req.currentUser!.userId))
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user following successful',
        followees: [mockFollowerData]
      })
    })

    it('should return empty following if user following does not exist', async () => {
      const req: Request = followersMockRequest({}, authUserPayload) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([])
      jest.spyOn(followService, 'getFollowees').mockResolvedValue([])

      await FollowGet.prototype.followees(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user following successful',
        followees: []
      })
    })
  })

  describe('followers', () => {
    it('should send correct json response if user follower exist in cache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        userId: `${existingUserTwo._id}`
      }) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([mockFollowerData])

      await FollowGet.prototype.followers(req, res)
      expect(FollowCache.prototype.getFollows).toBeCalledWith(`followers:${req.params.userId}`)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user followers successful',
        followers: [mockFollowerData]
      })
    })

    it('should send correct json response if user following exist in database', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        userId: `${existingUserTwo._id}`
      }) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([])
      jest.spyOn(followService, 'getFollowers').mockResolvedValue([mockFollowerData])

      await FollowGet.prototype.followers(req, res)
      expect(followService.getFollowers).toHaveBeenCalledWith(new ObjectId(req.params.userId))
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user followers successful',
        followers: [mockFollowerData]
      })
    })

    it('should return empty following if user following does not exist', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        userId: `${existingUserTwo._id}`
      }) as Request
      const res: Response = followersMockResponse()
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([])
      jest.spyOn(followService, 'getFollowers').mockResolvedValue([])

      await FollowGet.prototype.followers(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user followers successful',
        followers: []
      })
    })
  })
})
