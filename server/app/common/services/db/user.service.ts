import { Utils } from '@global/helpers/utils'
import { UserModel } from '@user/models/user.model'
import { IUserDocument } from '@user/interfaces/user.interface'

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data)
  }

  public async getUser(username: string, email: string): Promise<IUserDocument> {
    const query = {
      $or: [{ username: Utils.capitalize(username), email: Utils.lowercase(email) }]
    }
    const user: IUserDocument = (await UserModel.findOne(query).exec()) as IUserDocument
    return user
  }
}

export const userService: UserService = new UserService()
