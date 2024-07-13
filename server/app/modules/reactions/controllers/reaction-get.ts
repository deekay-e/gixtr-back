import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

//import { socketIONotificationObject } from '@socket/reaction'
import { ReactionCache } from '@service/redis/reaction.cache'
import { reactionQueue } from '@service/queues/reaction.queue'
import {
  IQueryReaction,
  IReactionDocument,
  IReactionJob
} from '@reaction/interfaces/reaction.interface'
import { reactionService } from '@service/db/reaction.service'
import mongoose from 'mongoose'

const reactionCache: ReactionCache = new ReactionCache()

export class ReactionGet {
  public async one(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params

    // get reaction data from redis or database if redis data doesn't exist
    const cachedReaction: [IReactionDocument, number] | [] = await reactionCache.getReaction(
      postId,
      username
    )
    const reaction: [IReactionDocument, number] | [] = cachedReaction
      ? cachedReaction
      : await reactionService.getReaction(postId, username)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get reaction successful', reaction: reaction[0], count: reaction[1] })
  }

  public async many(req: Request, res: Response): Promise<void> {
    const { postId } = req.params

    // get reaction data from redis or database if redis data doesn't exist
    const cachedReactions: [IReactionDocument[], number] = await reactionCache.getReactions(postId)
    const reactions: [IReactionDocument[], number] = cachedReactions[0].length
      ? cachedReactions
      : await reactionService.getReactions(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        )

    res.status(HTTP_STATUS.OK).json({
      message: 'Get reactions successful',
      reactions: reactions.length ? reactions[0] : {},
      count: reactions.length ? reactions[1] : 0
    })
  }

  public async manyByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params
    const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get reactions by username successful', reactions, count: reactions.length })
  }
}
