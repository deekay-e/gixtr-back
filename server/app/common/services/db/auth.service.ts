import JWT from 'jsonwebtoken'
import { ObjectId, PullOperator, PushOperator } from 'mongodb'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { AuthModel } from '@auth/models/auth.model'
import { IRole } from '@user/interfaces/user.interface'
import { IAuthDocument } from '@auth/interfaces/auth.interface'

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data)
  }

  public async updatePasswordToken(
    authId: string,
    token: string,
    expiration: number
  ): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: expiration
      }
    )
  }

  public async getAuthUser(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Utils.capitalize(username) }, { email: Utils.lowercase(email) }]
    }
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument
    return user
  }

  public async getAuthUserByToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec()) as IAuthDocument
    return user
  }

  public async updatePassword(email: string, password: string): Promise<void> {
    await AuthModel.updateOne({ email }, { $set: { password } }).exec()
  }

  public async updateRoles(data: IRole): Promise<void> {
    const { type, userId, role } = data
    if (type === 'add') {
      await AuthModel.updateOne(
        { _id: userId },
        { $push: { roles: role } as PushOperator<IAuthDocument> }
      ).exec()
    } else {
      await AuthModel.updateOne(
        { _id: userId },
        { $pull: { roles: role } as PullOperator<IAuthDocument> }
      ).exec()
    }
  }

  public getToken(data: IAuthDocument, userObjectId: string): string {
    return AuthService.prototype.signToken(data, userObjectId)
  }

  private signToken(data: IAuthDocument, userObjectId: string): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    )
  }
}

export const authService: AuthService = new AuthService()
