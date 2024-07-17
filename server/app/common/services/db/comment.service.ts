import mongoose from 'mongoose'

import { PostModel } from '@post/models/post.model'
import { UserCache } from '@service/redis/user.cache'
import { CommentModel } from '@comment/models/comment.model'
import { IPostDocument } from '@post/interfaces/post.interface'
import { IUserDocument } from '@user/interfaces/user.interface'
import {
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

  public async getComments(comment: ICommentJob): Promise<ICommentDocument[]> {
    const { query, sort } = comment
    const comments: ICommentDocument[] = await CommentModel.aggregate([
      { $match: query! },
      { $sort: sort! }
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

  public async getComment(comment: ICommentJob): Promise<ICommentDocument[]> {
    const { query } = comment
    const comments: ICommentDocument[] = (await CommentModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(query?._id) } }
    ])) as ICommentDocument[]
    return comments
  }

  public async deleteComment(comment: ICommentJob): Promise<void> {
    const { query } = comment
    await Promise.all([
      CommentModel.deleteOne(query),
      PostModel.updateOne(
        { _id: query?.postId },
        { $inc: { commentsCount: -1 } },
        { new: true }
      )
    ])
  }
}

export const commentService: CommentService = new CommentService()
