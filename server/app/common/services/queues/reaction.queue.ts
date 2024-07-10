import { reactionWorker } from '@worker/reaction.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IReactionJob } from '@reaction/interfaces/reaction.interface'

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reaction')

    this.processJob('addReaction', 5, reactionWorker.addReaction)
    this.processJob('removeReaction', 5, reactionWorker.removeReaction)
  }

  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data)
  }
}

export const reactionQueue: ReactionQueue = new ReactionQueue()
