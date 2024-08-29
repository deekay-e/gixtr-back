import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as postServer from '@socket/post'
import { authUserPayload } from '@mock/auth.mock'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'
import { PostUpdate } from '@post/controllers/post-update'
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload'
import {
  postMockData,
  postMockRequest,
  postMockResponse,
  updatedPost,
  updatedPostWithImage,
  updatedPostWithVideo
} from '@mock/post.mock'

jest.useFakeTimers()
jest.mock('@service/redis/post.cache')
jest.mock('@service/queues/base.queue')
jest.mock('@global/helpers/cloudinary-upload')

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
})

describe('PostUpdate', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('solo', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(updatedPost, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = postMockResponse()
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePost').mockResolvedValue(postMockData)
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      jest.spyOn(postQueue, 'addPostJob')

      await PostUpdate.prototype.solo(req, res)
      expect(postSpy).toHaveBeenCalledWith(`${postMockData._id}`, updatedPost)
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith(
        'update post',
        postMockData,
        'posts'
      )
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePost', {
        key: `${postMockData._id}`,
        value: postMockData
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post update successful'
      })
    })
  })

  describe('plusImage', () => {
    it('should send correct json response if imgId and imgVersion exists', async () => {
      updatedPostWithImage.imgId = '1234'
      updatedPostWithImage.imgVersion = '1234'
      updatedPost.imgId = '1234'
      updatedPost.imgVersion = '1234'
      updatedPost.post = updatedPostWithImage.post
      updatedPostWithImage.image = 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ=='
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = postMockResponse()
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePost')
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      jest.spyOn(postQueue, 'addPostJob')

      await PostUpdate.prototype.plusImage(req, res)
      expect(PostCache.prototype.updatePost).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postSpy.mock.calls[0][1]
      )
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith(
        'update post',
        postMockData,
        'posts'
      )
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePost', {
        key: `${postMockData._id}`,
        value: postMockData
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post update with image successful'
      })
    })

    it('should send correct json response if no imgId and imgVersion', async () => {
      updatedPostWithImage.imgId = '1234'
      updatedPostWithImage.imgVersion = '1234'
      updatedPost.imgId = '1234'
      updatedPost.imgVersion = '1234'
      updatedPost.post = updatedPostWithImage.post
      updatedPostWithImage.image = 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ=='
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = postMockResponse()
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePost')
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      jest.spyOn(postQueue, 'addPostJob')

      await PostUpdate.prototype.plusImage(req, res)
      expect(PostCache.prototype.updatePost).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postSpy.mock.calls[0][1]
      )
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith(
        'update post',
        postMockData,
        'posts'
      )
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePost', {
        key: `${postMockData._id}`,
        value: postMockData
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post update with image successful'
      })
    })
  })

  describe('plusVideo', () => {
    it('should send correct json response if vidId and vidVersion exists', async () => {
      updatedPostWithVideo.vidId = '1234'
      updatedPostWithVideo.vidVersion = '1234'
      updatedPost.vidId = '1234'
      updatedPost.vidVersion = '1234'
      updatedPost.post = updatedPostWithVideo.post
      updatedPostWithVideo.video = 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ=='
      const req: Request = postMockRequest(updatedPostWithVideo, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = postMockResponse()
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePost')
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      jest.spyOn(postQueue, 'addPostJob')

      await PostUpdate.prototype.plusVideo(req, res)
      expect(PostCache.prototype.updatePost).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postSpy.mock.calls[0][1]
      )
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith(
        'update post',
        postMockData,
        'posts'
      )
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePost', {
        key: `${postMockData._id}`,
        value: postMockData
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post update with video successful'
      })
    })

    it('should send correct json response if no vidId and vidVersion', async () => {
      updatedPostWithVideo.vidId = '1234'
      updatedPostWithVideo.vidVersion = '1234'
      updatedPost.vidId = '1234'
      updatedPost.vidVersion = '1234'
      updatedPost.post = updatedPostWithVideo.post
      updatedPostWithVideo.video = 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ=='
      const req: Request = postMockRequest(updatedPostWithVideo, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request
      const res: Response = postMockResponse()
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePost')
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      jest.spyOn(postQueue, 'addPostJob')

      await PostUpdate.prototype.plusVideo(req, res)
      expect(PostCache.prototype.updatePost).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postSpy.mock.calls[0][1]
      )
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith(
        'update post',
        postMockData,
        'posts'
      )
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePost', {
        key: `${postMockData._id}`,
        value: postMockData
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post update with video successful'
      })
    })
  })
})
