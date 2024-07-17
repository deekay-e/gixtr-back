import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as postServer from '@socket/post'
import { authUserPayload } from '@mock/auth.mock'
import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'
import { CommentEdit } from '@comment/controllers/comment-edit'
import { commentsData, reactionMockRequest, reactionMockResponse } from '@mock/reaction.mock'

jest.useFakeTimers()
jest.mock('@service/redis/post.cache')
jest.mock('@service/queues/base.queue')

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
})

describe('CommentEdit', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('init', () => {
    it('should send correct json response', async () => {
      const req: Request = reactionMockRequest({}, { comment: 'This the updated comment' }, authUserPayload, {
        postId: '',
        commentId: ''
      }) as Request
      const res: Response = reactionMockResponse()
      const postSpy = jest.spyOn(CommentCache.prototype, 'editComment').mockResolvedValue()
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      jest.spyOn(commentQueue, 'addCommentJob')

      await CommentEdit.prototype.init(req, res)
      expect(postSpy).toHaveBeenCalledWith('', {})
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith(
        'editComment',
        {commentsData},
        'comments'
      )
      expect(commentQueue.addCommentJob).toHaveBeenCalledWith('editComment', {
        _id: '',
        comment: commentsData
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comment update successful'
      })
    })
  })
})
