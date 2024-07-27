import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/comment'
import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'
import { JoiValidator } from '@global/decorators/joi-validation'
import { addCommentSchema } from '@comment/schemas/comment.schema'
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface'
import { ObjectId } from 'mongodb'

const commentCache: CommentCache = new CommentCache()

export class CommentAdd {
  @JoiValidator(addCommentSchema)
  public async init(req: Request, res: Response): Promise<void> {
    const username = req.currentUser!.username
    const avatarColor = req.currentUser!.avatarColor
    const { userTo, postId, comment, profilePicture } = req.body

    const newComment: ICommentDocument = {
      _id: new ObjectId(),
      postId,
      comment,
      username,
      profilePicture,
      avatarColor,
      createdAt: new Date()
    } as ICommentDocument

    // emit comment event to user and add comment data to redis
    //socketIONotificationObject.emit('addNotification', newComment)
    await commentCache.addComment(postId, newComment)

    // add comment data to databse
    const commentData: ICommentJob = {
      postId,
      userTo,
      username,
      comment: newComment,
      userFrom: req.currentUser!.userId
    }
    commentQueue.addCommentJob('addComment', commentData)

    res.status(HTTP_STATUS.OK).json({ message: 'Add comment successful' })
  }
}
