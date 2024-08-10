import mongoose from 'mongoose'
import { Request, Response } from 'express'

import { Utils } from '@global/helpers/utils'
import { existingUser } from '@mock/user.mock'
import { postMockData } from '@mock/post.mock'
import { UserGet } from '@user/controllers/user-get'
import { mockFollowerData } from '@mock/follow.mock'
import { PostCache } from '@service/redis/post.cache'
import { UserCache } from '@service/redis/user.cache'
import { userService } from '@service/db/user.service'
import { postService } from '@service/db/post.service'
import { FollowCache } from '@service/redis/follow.cache'
import { followService } from '@service/db/follow.service'
import { authMockRequest, authMockResponse, authUserPayload } from '@mock/auth.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/post.cache')
jest.mock('@service/redis/follower.cache')
jest.mock('@service/redis/user.cache')
jest.mock('@service/db/user.service')
jest.mock('@service/db/follower.service')

describe('UserGet', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('profiles', () => {
    it('should send success json response if users in cache', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, { page: '1' }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUsers').mockResolvedValue([existingUser])
      jest.spyOn(UserCache.prototype, 'getUsersCount').mockResolvedValue(1)
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([mockFollowerData])
      await UserGet.prototype.profiles(req, res)
      expect(FollowCache.prototype.getFollows).toHaveBeenCalledWith(
        `followees:${req.currentUser!.userId}`
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profiles successful',
        users: [existingUser],
        followers: [mockFollowerData],
        totalUsers: 1
      })
    })

    it('should send success json response if users in database', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, { page: '1' }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUsers').mockResolvedValue([])
      jest.spyOn(UserCache.prototype, 'getUsersCount').mockResolvedValue(0)
      jest.spyOn(FollowCache.prototype, 'getFollows').mockResolvedValue([])
      jest.spyOn(followService, 'getFollowees').mockResolvedValue([mockFollowerData])
      jest.spyOn(userService, 'getUsers').mockResolvedValue([existingUser])
      jest.spyOn(userService, 'getUsersCount').mockResolvedValue(1)

      await UserGet.prototype.profiles(req, res)
      expect(followService.getFollowees).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(req.currentUser!.userId)
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profiles successful',
        users: [existingUser],
        followers: [mockFollowerData],
        totalUsers: 1
      })
    })
  })

  describe('profile', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUser)
      await UserGet.prototype.profile(req, res)
      expect(UserCache.prototype.getUser).toHaveBeenCalledWith(`${req.currentUser?.userId}`)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile',
        user: existingUser
      })
    })

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(null)
      jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser)

      await UserGet.prototype.profile(req, res)
      expect(userService.getUserById).toHaveBeenCalledWith(`${req.currentUser?.userId}`)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile',
        user: existingUser
      })
    })
  })

  describe('profileAndPosts', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, {
        username: existingUser.username,
        userId: existingUser._id,
        uId: existingUser.uId
      }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUser)
      jest.spyOn(PostCache.prototype, 'getUserPosts').mockResolvedValue([postMockData])

      await UserGet.prototype.profileAndPosts(req, res)
      expect(UserCache.prototype.getUser).toHaveBeenCalledWith(`${req.currentUser?.userId}`)
      expect(PostCache.prototype.getUserPosts).toHaveBeenCalledWith(
        'post',
        parseInt(req.params.uId, 10)
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile and posts successful',
        user: existingUser,
        posts: [postMockData]
      })
    })

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, {
        username: existingUser.username,
        userId: existingUser._id,
        uId: existingUser.uId
      }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(null)
      jest.spyOn(PostCache.prototype, 'getUserPosts').mockResolvedValue([])
      jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser)
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData])

      const userName: string = Utils.capitalize(req.params.username)

      await UserGet.prototype.profileAndPosts(req, res)
      expect(userService.getUserById).toHaveBeenCalledWith(existingUser._id)
      expect(postService.getPosts).toHaveBeenCalledWith({ username: userName }, 0, 100, {
        createdAt: -1
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile and posts successful',
        user: existingUser,
        posts: [postMockData]
      })
    })
  })

  describe('profileByUserId', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, {
        userId: existingUser._id
      }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUser)

      await UserGet.prototype.profile(req, res)
      expect(UserCache.prototype.getUser).toHaveBeenCalledWith(req.params.userId)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile',
        user: existingUser
      })
    })

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, {
        userId: existingUser._id
      }) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(null)
      jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser)

      await UserGet.prototype.profile(req, res)
      expect(userService.getUserById).toHaveBeenCalledWith(req.params.userId)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile',
        user: existingUser
      })
    })
  })

  describe('randomUserSuggestions', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getRandomUsers').mockResolvedValue([existingUser])

      await UserGet.prototype.suggestions(req, res)
      expect(UserCache.prototype.getRandomUsers).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        `${req.currentUser?.username}`
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user suggestions successful',
        users: [existingUser]
      })
    })

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload) as Request
      const res: Response = authMockResponse()
      jest.spyOn(UserCache.prototype, 'getRandomUsers').mockResolvedValue([])
      jest.spyOn(userService, 'getRandomUsers').mockResolvedValue([existingUser])

      await UserGet.prototype.suggestions(req, res)
      expect(userService.getRandomUsers).toHaveBeenCalledWith(req.currentUser!.userId)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user suggestions successful',
        users: [existingUser]
      })
    })
  })
})
