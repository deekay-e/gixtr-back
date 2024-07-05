import { PostModel } from '@post/models/post.model'
import { IPostDocument } from '@post/interfaces/post.interface'


class PostService {
  public async createPost(data: IPostDocument): Promise<void> {
    await PostModel.create(data)
  }
}

export const postService: PostService = new PostService()
