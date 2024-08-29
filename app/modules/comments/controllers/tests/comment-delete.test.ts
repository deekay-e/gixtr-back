import { Server } from 'socket.io'
import { Request, Response } from 'express'

//import * as commentServer from '@socket/comment'
import { authUserPayload } from '@mock/auth.mock'
import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'
import { CommentDelete } from '@comment/controllers/comment-delete'
import { reactionMockRequest, reactionMockResponse } from '@mock/reaction.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/comment.cache')

/* Object.defineProperties(commentServer, {
  socketIOCommentObject: {
    value: new Server(),
    writable: true
  }
}) */

describe('CommentDelete', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest({}, {}, authUserPayload, {
      postId: '6027f77087c9d9ccb1555268',
      commentId: '6064861bc25eaa5a5d2f9bf4'
    }) as Request
    const res: Response = reactionMockResponse()
    const commentId = req.params.commentId
    const postId = req.params.postId

    //jest.spyOn(commentServer.socketIOCommentObject, 'emit')
    jest.spyOn(CommentCache.prototype, 'deleteComment')
    jest.spyOn(commentQueue, 'addCommentJob')

    await CommentDelete.prototype.init(req, res)

    // test expectations
    //expect(commentServer.socketIOCommentObject.emit).toHaveBeenCalledWith('deleteComment', commentId)
    expect(CommentCache.prototype.deleteComment).toHaveBeenCalledWith(postId, commentId)
    expect(commentQueue.addCommentJob).toHaveBeenCalledWith('deleteComment', {
      query: { _id: commentId, postId }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Delete comment successful'
    })
  })
})
