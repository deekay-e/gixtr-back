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
  ICommentJob,
  ICommentNameList
} from '@comment/interfaces/comment.interface'

const userCache: UserCache = new UserCache()

export class CommentService {
  public async addComment(commentObj: ICommentJob): Promise<void> {
    const { postId, userTo, username, comment } = commentObj
    const updatedComment: [IUserDocument, ICommentDocument, IPostDocument] = (await Promise.all([
      userCache.getUser(`${userTo}`),
      CommentModel.create(comment),
      PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { commentsCount: 1 } },
        { new: true }
      )
    ])) as unknown as [IUserDocument, ICommentDocument, IPostDocument]

    // send notifications here
  }

  public async getComments(
    query: IQueryComment,
    sort: Record<string, 1 | -1>
  ): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentModel.aggregate([
      { $match: query },
      { $sort: sort }
    ]) as ICommentDocument[]
    return comments
  }

  public async getCommentsNames(comment: ICommentJob): Promise<ICommentNameList[]> {
    const { query, sort } = comment
    const comments: ICommentNameList[] = await CommentModel.aggregate([
      { $match: query! },
      { $sort: sort! },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]) as ICommentNameList[]
    return comments
  }

  public async getComment(
    key: string,
    username: string
  ): Promise<[ICommentDocument]> {
    const comments: ICommentDocument[] = (await CommentModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(key), username: Utils.capitalize(username) } }
    ])) as ICommentDocument[]
    return [comments[0]]
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
