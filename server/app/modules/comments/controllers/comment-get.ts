import mongoose from 'mongoose'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/comment'
import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'
import {
  IQueryComment,
  ICommentDocument,
  ICommentJob
} from '@comment/interfaces/comment.interface'
import { commentService } from '@service/db/comment.service'

const commentCache: CommentCache = new CommentCache()

export class CommentGet {
  public async one(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params
    const commentJob: ICommentJob = {} as ICommentJob

    // get comment data from redis or database if redis data doesn't exist
    const cachedComment: [ICommentDocument, number] | [] = await commentCache.getComment(
      postId,
      username
    )
    const comment: [ICommentDocument, number] | [] = cachedComment.length
      ? cachedComment
      : await commentService.getComment(postId, username)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get comment successful', comment: comment.length ? comment[0] : {}, count: comment.length ? comment[1]: 0 })
  }

  public async many(req: Request, res: Response): Promise<void> {
    const { postId } = req.params

    // get comment data from redis or database if redis data doesn't exist
    const cachedComments: [ICommentDocument[], number] = await commentCache.getComments(postId)
    const comments: [ICommentDocument[], number] = cachedComments[0].length
      ? cachedComments
      : await commentService.getComments(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        )

    res.status(HTTP_STATUS.OK).json({
      message: 'Get comments successful',
      comments: comments.length ? comments[0] : {},
      count: comments.length ? comments[1] : 0
    })
  }

  public async manyByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params
    const comments: ICommentDocument[] = await commentService.getCommentsByUsername(username)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get comments by username successful', comments, count: comments.length })
  }
}
