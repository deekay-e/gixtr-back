import { ObjectId, PullOperator, PushOperator } from 'mongodb'

import { UserModel } from '@user/models/user.model'
import { IBlockedUserJob } from '@follower/interfaces/follower.interface'

class UserBlockService {
  /**
   * block
   */
  public async block(blockedJob: IBlockedUserJob): Promise<void> {
    const { userId, followeeId, type } = blockedJob
    if (type === 'block') {
      await UserModel.bulkWrite([
        {
          updateOne: {
            filter: { _id: userId, blocked: { $ne: new ObjectId(followeeId) } },
            update: { $push: { blocked: new ObjectId(followeeId) } as PushOperator<Document> }
          }
        },
        {
          updateOne: {
            filter: { _id: followeeId, blockedBy: { $ne: new ObjectId(userId) } },
            update: { $push: { blockedBy: new ObjectId(userId) } as PushOperator<Document> }
          }
        }
      ])
    }
  }

  /**
   * unblock
   */
  public async unblock(blockedJob: IBlockedUserJob): Promise<void> {
    const { userId, followeeId, type } = blockedJob
    if (type === 'unblock') {
      await UserModel.bulkWrite([
        {
          updateOne: {
            filter: { _id: userId, blocked: { $eq: new ObjectId(followeeId) } },
            update: { $pull: { blocked: new ObjectId(followeeId) } as PullOperator<Document> }
          }
        },
        {
          updateOne: {
            filter: { _id: followeeId, blockedBy: { $eq: new ObjectId(userId) } },
            update: { $pull: { blockedBy: new ObjectId(userId) } as PullOperator<Document> }
          }
        }
      ])
    }
  }
}

export const userBlock: UserBlockService = new UserBlockService()
