import mongoose from 'mongoose'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/comment'
import { CommentCache } from '@service/redis/comment.cache'
import {
  ICommentDocument,
  ICommentJob,
  ICommentNameList
} from '@comment/interfaces/comment.interface'
import { commentService } from '@service/db/comment.service'

const commentCache: CommentCache = new CommentCache()

export class CommentGet {
  public async one(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params
    const commentJob: ICommentJob = { query: { _id: commentId, postId } } as ICommentJob

    // get comment data from redis or database if redis data doesn't exist
    const cachedComment: ICommentDocument[] = await commentCache.getComment(postId, commentId)
    const comment: ICommentDocument[] = cachedComment.length
      ? cachedComment
      : await commentService.getComment(commentJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Get comment successful', comment: comment[0] })
  }

  public async many(req: Request, res: Response): Promise<void> {
    const { postId } = req.params
    const commentJob: ICommentJob = {
      query: { postId },
      sort: { createdAt: -1 }
    } as unknown as ICommentJob

    // get comment data from redis or database if redis data doesn't exist
    const cachedComments: ICommentDocument[] = await commentCache.getComments(postId)
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getComments(commentJob)

    res.status(HTTP_STATUS.OK).json({
      message: 'Get comments successful',
      comments
    })
  }

  public async manyNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params
    const commentJob: ICommentJob = {
      query: { postId },
      sort: { createdAt: -1 }
    } as unknown as ICommentJob
    const names: ICommentNameList[] = await commentService.getCommentsNames(commentJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Get comments names successful', names })
  }
}
