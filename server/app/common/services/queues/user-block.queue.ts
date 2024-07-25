import { BaseQueue } from '@service/queues/base.queue'
import { userBlockWorker } from '@worker/user-block.worker'
import { IBlockedUserJob } from '@follower/interfaces/follower.interface'

class UserBlockQueue extends BaseQueue {
  constructor() {
    super('userBlock')

    this.processJob('blockUser', 5, userBlockWorker.block)
    this.processJob('unblockUser', 5, userBlockWorker.unblock)
  }

  public addUserBlockJob(name: string, data: IBlockedUserJob): void {
    this.addJob(name, data)
  }
}

export const userBlockQueue: UserBlockQueue = new UserBlockQueue()
