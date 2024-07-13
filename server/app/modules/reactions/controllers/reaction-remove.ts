import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/reaction'
import { ReactionCache } from '@service/redis/reaction.cache'
import { reactionQueue } from '@service/queues/reaction.queue'
import { JoiValidator } from '@global/decorators/joi-validation'
import { removeReactionSchema } from '@reaction/schemas/reactions'
import { IReactionJob, IReactions } from '@reaction/interfaces/reaction.interface'

const reactionCache: ReactionCache = new ReactionCache()

export class ReactionRemove {
  @JoiValidator(removeReactionSchema)
  public async init(req: Request, res: Response): Promise<void> {
    const username = req.currentUser!.username
    const { postId, prevReaction } = req.params
    const postReactions: IReactions = {"like":0,"love":0,"happy":0,"sad":0,"wow":0,"angry":0} as IReactions

    // emit reaction event to user and remove reaction data from redis
    //socketIONotificationObject.emit('addNotification', newReaction)
    await reactionCache.removeReaction(postId, username, postReactions)

    // remove reaction data from databse
    const reactionData: IReactionJob = {
      postId,
      username,
      prevReaction
    }
    reactionQueue.addReactionJob('removeReaction', reactionData)

    res.status(HTTP_STATUS.OK).json({ message: 'Remove reaction successful' })
  }
}
