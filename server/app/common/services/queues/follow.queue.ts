import { followWorker } from '@worker/follow.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IBlockedUserJob, IFollowerJob } from '@follower/interfaces/follower.interface'

class FollowQueue extends BaseQueue {
  constructor() {
    super('follow')

    this.processJob('addFollow', 5, followWorker.addFollower)
    this.processJob('removeFollow', 5, followWorker.removeFollower)
  }

  public addFollowerJob(name: string, data: IFollowerJob): void {
    this.addJob(name, data)
  }
}

export const followQueue: FollowQueue = new FollowQueue()
