import { omit } from 'lodash'
import { ObjectId } from 'mongodb'

import { Utils } from '@global/helpers/utils'
import { PostModel } from '@post/models/post.model'
import { UserCache } from '@service/redis/user.cache'
import { ReactionModel } from '@reaction/models/reaction.model'
import { IPostDocument } from '@post/interfaces/post.interface'
import { IUserDocument } from '@user/interfaces/user.interface'
import {
  IQueryReaction,
  IReactionDocument,
  IReactionJob
} from '@reaction/interfaces/reaction.interface'
import {
  INotificationDocument,
  INotificationTemplate
} from '@notification/interfaces/notification.interface'
import { NotificationModel } from '@notification/models/notification.model'
import { mailQueue } from '@service/queues/mail.queue'
import { notification } from '@service/email/templates/notification/template'
import { socketIONotificationObject } from '@socket/notification'

const userCache: UserCache = new UserCache()

export class ReactionService {
  public async addReaction(reaction: IReactionJob): Promise<void> {
    const { postId, userTo, userFrom, username, type, prevReaction, reactionObject } = reaction
    let metaReactionObj: IReactionDocument = reactionObject as IReactionDocument
    if (prevReaction) metaReactionObj = omit(reactionObject, ['_id'])
    const res: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userCache.getUser(`${userTo}`),
      ReactionModel.replaceOne({ postId, username, type: prevReaction }, metaReactionObj, {
        upsert: true
      }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${prevReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument]

    // send notifications here
    if (res[0]?.notifications.reactions && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel()
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom!,
        userTo: userTo!,
        message: `${username} reacted to your post`,
        type: 'reactiom',
        entityId: new ObjectId(postId),
        createdItemId: new ObjectId(metaReactionObj._id),
        createdAt: new Date(),
        comment: '',
        post: res[2].post,
        imgId: res[2].imgId!,
        imgVersion: res[2].imgVersion!,
        gifUrl: res[2].gifUrl!,
        reaction: type!
      })

      // send to client via socketIO
      socketIONotificationObject.emit('new follower', notifications, { userTo })

      // send to email queue
      const templateData: INotificationTemplate = {
        username: res[1].username!,
        message: `${username} reacted to your post`,
        header: 'Reaction Notification'
      }
      const template: string = notification.render(templateData)
      mailQueue.addMailJob('reactionNotification', {
        receiver: res[0].email!,
        template,
        subject: 'New reaction notification'
      })
    }
  }

  public async getReactions(
    query: IQueryReaction,
    sort: Record<string, 1 | -1>
  ): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: query },
      { $sort: sort }
    ])
    return [reactions, reactions.length]
  }

  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = (await ReactionModel.aggregate([
      { $match: { username: Utils.capitalize(username) } }
    ])) as IReactionDocument[]
    return reactions
  }

  public async getReaction(
    key: string,
    username: string
  ): Promise<[IReactionDocument, number] | []> {
    const reactions: IReactionDocument[] = (await ReactionModel.aggregate([
      /* { $match: { $or: [
        { postId: new ObjectId(key) },
        { commentId: new ObjectId(key) }
      ], username: Utils.capitalize(username) } } */
      { $match: { postId: new ObjectId(key), username: Utils.capitalize(username) } }
    ])) as IReactionDocument[]
    return reactions.length ? [reactions[0], 1] : []
  }

  public async removeReaction(reaction: IReactionJob): Promise<void> {
    const { postId, prevReaction, username } = reaction
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: prevReaction, username }),
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${prevReaction}`]: -1
          }
        },
        { new: true }
      )
    ])
  }
}

export const reactionService: ReactionService = new ReactionService()
