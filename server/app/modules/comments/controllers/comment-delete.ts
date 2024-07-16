import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/comment'
import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'
import { ICommentJob } from '@comment/interfaces/comment.interface'

const commentCache: CommentCache = new CommentCache()

export class CommentDelete {
  public async init(req: Request, res: Response): Promise<void> {
    const { postId } = req.params
    const username = req.currentUser!.username

    // emit comment event to user and delete comment data from redis
    //socketIONotificationObject.emit('addNotification', newComment)
    await commentCache.deleteComment(postId, username)

    // delete comment data from databse
    const commentData: ICommentJob = {
      postId,
      username,
    } as ICommentJob
    commentQueue.addCommentJob('deleteComment', commentData)

    res.status(HTTP_STATUS.OK).json({ message: 'Delete comment successful' })
  }
}
