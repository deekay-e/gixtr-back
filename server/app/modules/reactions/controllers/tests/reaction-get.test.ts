import mongoose from 'mongoose'
import { Request, Response } from 'express'

import { postMockData } from '@mock/post.mock'
import { authUserPayload } from '@mock/auth.mock'
import { ReactionCache } from '@service/redis/reaction.cache'
import { reactionService } from '@service/db/reaction.service'
import { ReactionGet } from '@reaction/controllers/reaction-get'
import { reactionMockRequest, reactionMockResponse, reactionData } from '@mock/reaction.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/reaction.cache')

describe('ReactionGet', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('many', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(ReactionCache.prototype, 'getReactions').mockResolvedValue([[reactionData], 1])

      await ReactionGet.prototype.many(req, res)
      expect(ReactionCache.prototype.getReactions).toHaveBeenCalledWith(`${postMockData._id}`)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reactions successful',
        reactions: [reactionData],
        count: 1
      })
    })

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(ReactionCache.prototype, 'getReactions').mockResolvedValue([[], 0])
      jest.spyOn(reactionService, 'getReactions').mockResolvedValue([[reactionData], 1])

      await ReactionGet.prototype.many(req, res)
      expect(reactionService.getReactions).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId(`${postMockData._id}`) },
        { createdAt: -1 }
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reactions successful',
        reactions: [reactionData],
        count: 1
      })
    })

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(ReactionCache.prototype, 'getReactions').mockResolvedValue([[], 0])
      jest.spyOn(reactionService, 'getReactions').mockResolvedValue([[], 0])

      await ReactionGet.prototype.many(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reactions successful',
        reactions: [],
        count: 0
      })
    })
  })

  describe('one', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(ReactionCache.prototype, 'getReaction').mockResolvedValue([reactionData, 1])

      await ReactionGet.prototype.one(req, res)
      expect(ReactionCache.prototype.getReaction).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postMockData.username
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reaction successful',
        reaction: reactionData,
        count: 1
      })
    })

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(ReactionCache.prototype, 'getReaction').mockResolvedValue([])
      jest.spyOn(reactionService, 'getReaction').mockResolvedValue([reactionData, 1])

      await ReactionGet.prototype.one(req, res)
      expect(reactionService.getReaction).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postMockData.username
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reaction successful',
        reaction: reactionData,
        count: 1
      })
    })

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(ReactionCache.prototype, 'getReaction').mockResolvedValue([])
      jest.spyOn(reactionService, 'getReaction').mockResolvedValue([])

      await ReactionGet.prototype.one(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reaction successful',
        reaction: {},
        count: 0
      })
    })
  })

  describe('manyByUsername', () => {
    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([reactionData])

      await ReactionGet.prototype.manyByUsername(req, res)
      expect(reactionService.getReactionsByUsername).toHaveBeenCalledWith(postMockData.username)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reactions by username successful',
        reactions: [reactionData],
        count: 1
      })
    })

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([])

      await ReactionGet.prototype.manyByUsername(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get reactions by username successful',
        reactions: [],
        count: 0
      })
    })
  })
})
