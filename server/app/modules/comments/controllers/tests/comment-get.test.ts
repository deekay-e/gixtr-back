import mongoose from 'mongoose'
import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import { CommentCache } from '@service/redis/comment.cache'
import { commentService } from '@service/db/comment.service'
import { CommentGet } from '@comment/controllers/comment-get'
import {
  commentNames,
  commentsData,
  reactionMockRequest,
  reactionMockResponse
} from '@mock/reaction.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/comment.cache')

describe('CommentGet', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('comments', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(CommentCache.prototype, 'getComments').mockResolvedValue([commentsData])

      await CommentGet.prototype.many(req, res)
      expect(CommentCache.prototype.getComments).toHaveBeenCalledWith('6027f77087c9d9ccb1555268')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get comments successful',
        comments: [commentsData]
      })
    })

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(CommentCache.prototype, 'getComments').mockResolvedValue([])
      jest.spyOn(commentService, 'getComments').mockResolvedValue([commentsData])

      await CommentGet.prototype.many(req, res)
      expect(commentService.getComments).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get comments successful',
        comments: [commentsData]
      })
    })
  })

  describe('commentsNames', () => {
    it('should send correct json response if data exist in redis', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(CommentCache.prototype, 'getCommentsNames').mockResolvedValue([commentNames])

      await CommentGet.prototype.manyNames(req, res)
      expect(CommentCache.prototype.getCommentsNames).toHaveBeenCalledWith(
        '6027f77087c9d9ccb1555268'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get comments names successful',
        comments: commentNames
      })
    })

    it('should send correct json response if data exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(CommentCache.prototype, 'getCommentsNames').mockResolvedValue([])
      jest.spyOn(commentService, 'getCommentsNames').mockResolvedValue([commentNames])

      await CommentGet.prototype.manyNames(req, res)
      expect(commentService.getCommentsNames).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get comments names successful',
        comments: commentNames
      })
    })

    it('should return empty comments if data does not exist in redis and database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(CommentCache.prototype, 'getCommentsNames').mockResolvedValue([])
      jest.spyOn(commentService, 'getCommentsNames').mockResolvedValue([])

      await CommentGet.prototype.manyNames(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get comments names successful',
        comments: []
      })
    })
  })

  describe('getComment', () => {
    it('should send correct json response from cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(CommentCache.prototype, 'getComment').mockResolvedValue([commentsData])

      await CommentGet.prototype.one(req, res)
      expect(CommentCache.prototype.getComment).toHaveBeenCalledWith(
        '6027f77087c9d9ccb1555268',
        '6064861bc25eaa5a5d2f9bf4'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get comment successful',
        comments: commentsData
      })
    })

    it('should send correct json response from database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request
      const res: Response = reactionMockResponse()
      jest.spyOn(CommentCache.prototype, 'getComment').mockResolvedValue([])
      jest.spyOn(commentService, 'getComment').mockResolvedValue([commentsData])

      await CommentGet.prototype.one(req, res)
      expect(commentService.getComments).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId('6064861bc25eaa5a5d2f9bf4') },
        { createdAt: -1 }
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get comment successful',
        comments: commentsData
      })
    })
  })
})
