import JWT from 'jsonwebtoken'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { AuthModel } from '@auth/models/auth.model'
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

  public async getUser(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Utils.capitalize(username) }, { email: Utils.lowercase(email) }]
    }
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument
    return user
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      email: Utils.lowercase(email)
    }).exec()) as IAuthDocument
    return user
  }

  public async getAuthUserByToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec()) as IAuthDocument
    return user
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
