import { IPostDocument } from '@post/interfaces/post.interface'
import { PostModel } from '@post/models/post.model'
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface'
import { ReactionModel } from '@reaction/models/reaction.model'
import { UserCache } from '@service/redis/user.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import { omit } from 'lodash'

const userCache: UserCache = new UserCache()

export class ReactionService {
  public async addReaction(reaction: IReactionJob): Promise<void> {
    const { postId, userTo, userFrom, username, type, prevReaction, reactionObject } = reaction
    let metaReactionObj: IReactionDocument = reactionObject as IReactionDocument
    if (prevReaction) metaReactionObj = omit(reactionObject, ['_id'])
    const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
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
  }

  public async removeReaction(reaction: IReactionJob) {
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
