import mongoose from 'mongoose'

import { Utils } from '@global/helpers/utils'
import { PostModel } from '@post/models/post.model'
import { UserCache } from '@service/redis/user.cache'
import { CommentModel } from '@comment/models/comment.model'
import { IPostDocument } from '@post/interfaces/post.interface'
import { IUserDocument } from '@user/interfaces/user.interface'
import {
  IQueryComment,
  ICommentDocument,
  ICommentJob
} from '@comment/interfaces/comment.interface'

const userCache: UserCache = new UserCache()

export class CommentService {
  public async addComment(commentObj: ICommentJob): Promise<void> {
    const { postId, userTo, username, comment } = commentObj
    let metaCommentObj: ICommentDocument = comment as ICommentDocument
    const updatedComment: [IUserDocument, ICommentDocument, IPostDocument] = (await Promise.all([
      userCache.getUser(`${userTo}`),
      CommentModel.replaceOne({ postId, username, comment }, metaCommentObj, {
        upsert: true
      }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            ['commentsCount']: 1
          }
        },
        { new: true }
      )
    ])) as unknown as [IUserDocument, ICommentDocument, IPostDocument]

    // send notifications here
  }

  public async getComments(
    query: IQueryComment,
    sort: Record<string, 1 | -1>
  ): Promise<[ICommentDocument[], number]> {
    const comments: ICommentDocument[] = await CommentModel.aggregate([
      { $match: query },
      { $sort: sort }
    ])
    return [comments, comments.length]
  }

  public async getCommentsByUsername(username: string): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = (await CommentModel.aggregate([
      { $match: { username: Utils.capitalize(username) } }
    ])) as ICommentDocument[]
    return comments
  }

  public async getComment(
    key: string,
    username: string
  ): Promise<[ICommentDocument, number] | []> {
    const comments: ICommentDocument[] = (await CommentModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(key), username: Utils.capitalize(username) } }
    ])) as ICommentDocument[]
    return comments.length ? [comments[0], 1] : []
  }

  public async deleteComment(comment: ICommentJob): Promise<void> {
    const { postId, username } = comment
    await Promise.all([
      CommentModel.deleteOne({ postId, username }),
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            ['commentsCount']: -1
          }
        },
        { new: true }
      )
    ])
  }
}

export const commentService: CommentService = new CommentService()
