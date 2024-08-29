import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIOPostObject } from '@socket/post'
import { commentQueue } from '@service/queues/comment.queue'
import { CommentCache } from '@service/redis/comment.cache'
import { joiValidator } from '@global/decorators/joi-validation'
import { editCommentSchema } from '@comment/schemas/comment.schema'
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface'

const commentCache: CommentCache = new CommentCache()

export class CommentEdit {
  @joiValidator(editCommentSchema)
  public async init(req: Request, res: Response): Promise<void> {
    const { comment } = req.body
    const { postId, commentId } = req.params
    const updatedComment: ICommentDocument = { _id: commentId, comment } as ICommentDocument

    // update comment data in redis and emit comment event to user
    await commentCache.editComment(postId, commentId, comment)
    socketIOPostObject.emit('checkComment', updatedComment, 'comments')

    // update comment data in databse
    const commentJob: ICommentJob = { comment: updatedComment }
    commentQueue.addCommentJob('editComment', commentJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Comment update successful' })
  }
}
