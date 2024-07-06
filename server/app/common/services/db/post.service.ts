import { Query, UpdateQuery } from 'mongoose'

import { UserModel } from '@user/models/user.model'
import { PostModel } from '@post/models/post.model'
import { IUserDocument } from '@user/interfaces/user.interface'
import {
  IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDeleted
} from '@post/interfaces/post.interface'


class PostService {
  public async createPost(userId: string, data: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(data)
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: 1 } }
    )
    await Promise.all([post, user])
  }

  public async getPosts(
    query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>
  ): Promise<IPostDocument[]> {
    let postQuery = {}
    if (query?.imgId && query?.gifUrl)
      postQuery = { $or: [{ imgId: { $ne: '' }}, { gifUrl: { $ne: '' }}]}
    else postQuery = query

    const posts: IPostDocument[] = await PostModel.aggregate([
      { $match: postQuery },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ])
    return posts
  }

  public async getPostsCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments()
    return count
  }

  public async deletePost(postId: string, userId: string): Promise<void> {
    const post: Query<IQueryComplete & IQueryDeleted, IPostDocument> =
      PostModel.deleteOne({ _id: postId })
    // delete post comments and reaction here
    //   once the modules are implemented
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: -1 } }
    )
    await Promise.all([post, user])
  }
}

export const postService: PostService = new PostService()
