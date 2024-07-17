import mongoose from 'mongoose'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/comment'
import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'
import {
  ICommentDocument,
  ICommentJob,
  ICommentNameList
} from '@comment/interfaces/comment.interface'
import { commentService } from '@service/db/comment.service'

const commentCache: CommentCache = new CommentCache()

export class CommentGet {
  public async one(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params
    const commentJob: ICommentJob = {} as ICommentJob

    // get comment data from redis or database if redis data doesn't exist
    const cachedComment: [ICommentDocument] | [] = await commentCache.getComment(
      postId,
      username
    )
    const comment: [ICommentDocument] | [] = cachedComment.length
      ? cachedComment
      : await commentService.getComment(postId, username)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get comment successful', comment })
  }

  public async many(req: Request, res: Response): Promise<void> {
    const { postId } = req.params

    // get comment data from redis or database if redis data doesn't exist
    const cachedComments: ICommentDocument[] = await commentCache.getComments(postId)
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getComments(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        )

    res.status(HTTP_STATUS.OK).json({
      message: 'Get comments successful',
      comments: comments.length ? comments : {}
    })
  }

  public async manyNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params
    const commentJob: ICommentJob = { query: { postId }, sort: { createdAt: -1 } } as unknown as ICommentJob
    const comments: ICommentNameList[] = await commentService.getCommentsNames(commentJob)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get comments names successful', comments })
  }
}
