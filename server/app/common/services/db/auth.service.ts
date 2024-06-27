import { Utils } from '@global/helpers/utils'
import { AuthModel } from '@auth/models/auth.model'
import { IAuthDocument } from '@auth/interfaces/auth.interface'

class AuthService {
  public async getUser(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Utils.capitalize(username), email: Utils.lowercase(email) }]
    }
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument
    return user
  }
}

export const authService: AuthService = new AuthService()
