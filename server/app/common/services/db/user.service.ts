import { ObjectId } from 'mongodb'

import { UserModel } from '@user/models/user.model'
import { IUserDocument } from '@user/interfaces/user.interface'

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data)
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new ObjectId(userId) } },
      { $lookup: { from: 'auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.projectAggregate() }
    ])
    return users[0]
  }

  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new ObjectId(authId) } },
      { $lookup: { from: 'auth', localField: 'authId', foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      { $project: this.projectAggregate() }
    ])
    return users[0]
  }

  public async getUsers(key: string, skip: number, limit: number): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new ObjectId(key) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'auth', localField: 'authId', foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      { $project: this.projectAggregate() }
    ])
    return users
  }

  private projectAggregate() {
    return {
      _id: 1,
      uId: '$auth.uId',
      email: '$auth.email',
      username: '$auth.username',
      avatarColor: '$auth.avatarColor',
      createdAt: '$auth.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      imageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    }
  }
}

export const userService: UserService = new UserService()
