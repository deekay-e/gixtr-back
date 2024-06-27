import JWT from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { Utils } from '@global/helpers/utils'
import { AuthModel } from '@auth/models/auth.model'
import { IAuthDocument } from '@auth/interfaces/auth.interface'

import { config } from '@/config'

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data)
  }

  public async getUser(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Utils.capitalize(username), email: Utils.lowercase(email) }]
    }
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument
    return user
  }

  public getToken(data: IAuthDocument, userObjectId: ObjectId | string): string {
    return AuthService.prototype.signToken(data, userObjectId)
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId | string): string {
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
