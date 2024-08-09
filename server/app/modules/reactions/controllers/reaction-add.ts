import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/reaction'
import { ReactionCache } from '@service/redis/reaction.cache'
import { reactionQueue } from '@service/queues/reaction.queue'
import { addReactionSchema } from '@reaction/schemas/reactions'
import { joiValidator } from '@global/decorators/joi-validation'
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface'

const reactionCache: ReactionCache = new ReactionCache()

export class ReactionAdd {
  @joiValidator(addReactionSchema)
  public async init(req: Request, res: Response): Promise<void> {
    const username = req.currentUser!.username
    const { userTo, postId, type, prevReaction, postReactions, profilePicture } = req.body

    const newReaction: IReactionDocument = {
      postId,
      type,
      username,
      profilePicture,
      avatarColor: req.currentUser!.avatarColor
    } as IReactionDocument

    // emit reaction event to user and add reaction data to redis
    //socketIONotificationObject.emit('addNotification', newReaction)
    await reactionCache.addReaction(postId, newReaction, postReactions, type, prevReaction)

    // add reaction data to databse
    const reactionData: IReactionJob = {
      postId,
      type,
      userTo,
      username,
      prevReaction,
      reactionObject: newReaction,
      userFrom: req.currentUser!.userId
    }
    reactionQueue.addReactionJob('addReaction', reactionData)

    res.status(HTTP_STATUS.OK).json({ message: 'Add reaction successful' })
  }
}
