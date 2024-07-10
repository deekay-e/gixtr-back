import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIOReactionObject } from '@socket/reaction'
import { ReactionCache } from '@service/redis/reaction.cache'
//import { reactionQueue } from '@service/queues/reaction.queue'
import { addReactionSchema } from '@reaction/schemas/reactions'
import { JoiValidator } from '@global/decorators/joi-validation'
import { IReactionDocument } from '@reaction/interfaces/reaction.interface'

const reactionCache: ReactionCache = new ReactionCache()

export class ReactionAdd {
  @JoiValidator(addReactionSchema)
  public async init(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, prevReaction, postReactions, profilePicture } = req.body

    const newReaction: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      profilePicture,
      avatarColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username
    } as IReactionDocument

    // emit reaction event to user and add reaction data to redis
    //socketIOReactionObject.emit('addReaction', newReaction)
    await reactionCache.addReaction(postId, newReaction, postReactions, type, prevReaction)

    // add reaction data to databse
    //reactionQueue.addReactionJob('addToReaction', { key: postId, value: newReaction })

    res.status(HTTP_STATUS.OK).json({ message: 'Add reaction successful' })
  }
}
