import { Request, Response } from 'express'
import { authUserPayload } from '@mock/auth.mock'
import { PostGet } from '@post/controllers/post-get'
import { PostCache } from '@service/redis/post.cache'
import { postService } from '@service/db/post.service'
import { post, postMockData, postMockRequest, postMockResponse } from '@mock/post.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/post.cache')

describe('PostGet', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('posts', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as Request
      const res: Response = postMockResponse()
      jest.spyOn(PostCache.prototype, 'getPosts').mockResolvedValue([postMockData])
      jest.spyOn(PostCache.prototype, 'getPostsCount').mockResolvedValue(1)

      await PostGet.prototype.many(req, res)
      expect(PostCache.prototype.getPosts).toHaveBeenCalledWith('post', 0, 10)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get all posts',
        posts: [postMockData],
        totalPosts: 1
      })
    })

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as Request
      const res: Response = postMockResponse()
      jest.spyOn(PostCache.prototype, 'getPosts').mockResolvedValue([])
      jest.spyOn(PostCache.prototype, 'getPostsCount').mockResolvedValue(0)
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData])
      jest.spyOn(postService, 'getPostsCount').mockResolvedValue(1)

      await PostGet.prototype.many(req, res)
      expect(postService.getPosts).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get all posts',
        posts: [postMockData],
        totalPosts: 1
      })
    })

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as Request
      const res: Response = postMockResponse()
      jest.spyOn(PostCache.prototype, 'getPosts').mockResolvedValue([])
      jest.spyOn(PostCache.prototype, 'getPostsCount').mockResolvedValue(0)
      jest.spyOn(postService, 'getPosts').mockResolvedValue([])
      jest.spyOn(postService, 'getPostsCount').mockResolvedValue(0)

      await PostGet.prototype.many(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get all posts',
        posts: [],
        totalPosts: 0
      })
    })
  })

  describe('postWithImages', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as Request
      const res: Response = postMockResponse()
      jest.spyOn(PostCache.prototype, 'getPostsWithImages').mockResolvedValue([postMockData])

      await PostGet.prototype.manywithImages(req, res)
      expect(PostCache.prototype.getPostsWithImages).toHaveBeenCalledWith('post', 0, 10)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get all posts with images',
        posts: [postMockData]
      })
    })

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as Request
      const res: Response = postMockResponse()
      jest.spyOn(PostCache.prototype, 'getPostsWithImages').mockResolvedValue([])
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData])

      await PostGet.prototype.manywithImages(req, res)
      expect(postService.getPosts).toHaveBeenCalledWith(
        { imgId: '$ne', gifUrl: '$ne' }, 0, 10, { createdAt: -1 }
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get all posts with images',
        posts: [postMockData]
      })
    })

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as Request
      const res: Response = postMockResponse()
      jest.spyOn(PostCache.prototype, 'getPostsWithImages').mockResolvedValue([])
      jest.spyOn(postService, 'getPosts').mockResolvedValue([])

      await PostGet.prototype.manywithImages(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get all posts with images',
        posts: []
      })
    })
  })
})
