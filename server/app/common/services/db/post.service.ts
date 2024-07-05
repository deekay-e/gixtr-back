import { PostModel } from '@post/models/post.model'
import { IPostDocument } from '@post/interfaces/post.interface'
import { UpdateQuery } from 'mongoose'
import { IUserDocument } from '@user/interfaces/user.interface'
import { UserModel } from '@user/models/user.model'


class PostService {
  public async createPost(userId: string, data: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(data)
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: 1 } }
    )
    await Promise.all([post, user])
  }
}

export const postService: PostService = new PostService()
