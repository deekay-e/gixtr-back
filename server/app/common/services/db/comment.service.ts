import { UpdateQuery } from 'mongoose'

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
import { INotificationDocument } from '@notification/interfaces/notification.interface'
import { NotificationModel } from '@notification/models/notification.model'
import { ObjectId } from 'mongodb'
import { socketIONotificationObject } from '@socket/notification'

const userCache: UserCache = new UserCache()

export class CommentService {
  public async addComment(commentObj: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, username, comment } = commentObj
    const updatedComment: [IUserDocument, ICommentDocument, IPostDocument] = (await Promise.all([
      userCache.getUser(`${userTo}`),
      CommentModel.create(comment),
      PostModel.findOneAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 } }, { new: true })
    ])) as unknown as [IUserDocument, ICommentDocument, IPostDocument]

    // send notifications here
    if (updatedComment[0].notifications.comments && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel()
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom!,
        userTo: userTo!,
        message: `${username} commented on your post`,
        type: 'comment',
        entityId: new ObjectId(postId),
        createdItemId: new ObjectId(updatedComment[0]._id),
        createdAt: new Date(),
        comment: comment!.comment,
        post: updatedComment[2].post,
        imgId: updatedComment[2].imgId!,
        imgVersion: updatedComment[2].imgVersion!,
        gifUrl: updatedComment[2].gifUrl!,
        reaction: ''
      })

      // send to client via socketIO
      socketIONotificationObject.emit('new notification', notifications, { userTo })

      // send to email queue
    }
  }

  public async getComment(comment: ICommentJob): Promise<ICommentDocument[]> {
    const { query } = comment
    const comments: ICommentDocument[] = (await CommentModel.aggregate([
      { $match: { _id: query?._id } }
    ])) as ICommentDocument[]
    return comments
  }

  public async getComments(comment: ICommentJob): Promise<ICommentDocument[]> {
    const { query, sort } = comment
    const comments: ICommentDocument[] = (await CommentModel.aggregate([
      { $match: query! },
      { $sort: sort! }
    ])) as ICommentDocument[]
    return comments
  }

  public async getCommentsNames(comment: ICommentJob): Promise<ICommentNameList[]> {
    const { query, sort } = comment
    const comments: ICommentNameList[] = (await CommentModel.aggregate([
      { $match: query! },
      { $sort: sort! },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ])) as ICommentNameList[]
    return comments
  }

  public async editComment(commentJob: ICommentJob): Promise<void> {
    const { comment } = commentJob
    const post: UpdateQuery<ICommentDocument> = CommentModel.updateOne(
      { _id: comment?._id },
      { $set: comment }
    )
    await Promise.all([post])
  }

  public async deleteComment(comment: ICommentJob): Promise<void> {
    const { query } = comment
    await Promise.all([
      CommentModel.deleteOne(query),
      PostModel.updateOne({ _id: query?.postId }, { $inc: { commentsCount: -1 } }, { new: true })
    ])
  }
}

export const commentService: CommentService = new CommentService()
