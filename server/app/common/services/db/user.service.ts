import { ObjectId } from 'mongodb'

import { Utils } from '@global/helpers/utils'
import { followService } from './follow.service'
import { UserModel } from '@user/models/user.model'
import {
  IBasicInfo,
  ISearchUser,
  ISocialLinks,
  IUserDocument
} from '@user/interfaces/user.interface'
import { AuthModel } from '@auth/models/auth.model'

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

  public async getRandomUsers(key: string): Promise<IUserDocument[]> {
    const followees: string[] = await followService.getFolloweeIds(key)
    const users: IUserDocument[] = await UserModel.aggregate([
      {
        $match: {
          $and: [
            { _id: { $ne: new ObjectId(key) } },
            { _id: { $nin: followees.map((item) => new ObjectId(item)) } }
          ]
        }
      },
      { $sample: { size: 10 } },
      { $lookup: { from: 'auth', localField: 'authId', foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      {
        $addFields: {
          email: '$auth.email',
          username: '$auth.username',
          avatarColor: '$auth.avatarColor',
          createdAt: '$auth.createdAt',
          uId: '$auth.uId'
        }
      },
      {
        $project: {
          auth: 0,
          __v: 0
        }
      }
    ])
    return users
  }

  public async getUsersCount(): Promise<number> {
    const userCount: number = await UserModel.find({}).countDocuments()
    return userCount
  }

  public async searchUsers(regExp: RegExp): Promise<ISearchUser[]> {
    const users = await AuthModel.aggregate([
      { $match: { username: regExp } },
      { $lookup: { from: 'users', localField: '_id', foreignField: 'authId', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          _id: '$user._id',
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: 1
        }
      }
    ])
    return users
  }

  public async updatePassword(userId: string, password: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { password } }).exec()
  }

  public async updateUserInfo(userId: string, info: IBasicInfo): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          firstname: info['firstname'],
          lastname: info['lastname'],
          nickname: info['nickname'],
          work: info['work'],
          quote: info['quote'],
          school: info['school'],
          location: info['location']
        }
      }
    ).exec()
  }

  public async updateSocials(userId: string, links: ISocialLinks): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { social: links } }).exec()
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
