import { userWorker } from '@worker/user.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IUserJob } from '@user/interfaces/user.interface'

class UserQueue extends BaseQueue {
  constructor() {
    super('user')

    this.processJob('addToUser', 5, userWorker.addUserToDB)
    this.processJob('updateSocials', 5, userWorker.updateSocials)
    this.processJob('updateUserInfo', 5, userWorker.updateUserInfo)
  }

  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data)
  }
}

export const userQueue: UserQueue = new UserQueue()
