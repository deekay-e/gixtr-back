import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { PostCache } from '@service/redis/post.cache'
import { postService } from '@service/db/post.service'
import { IPostDocument } from '@post/interfaces/post.interface'

const postCache: PostCache = new PostCache()
const PAGE_SIZE = 10

export class PostGet {
  public async minusImage(req: Request, res: Response): Promise<void> {
    const { page } = req.params
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE
    const limit: number = PAGE_SIZE * parseInt(page)
    const start: number = skip === 0 ? skip : skip + 1
    let posts: IPostDocument[] = []
    let postsCount = 0
    const cachedPosts: IPostDocument[] = await postCache.getPosts('post', start, limit)
    if (cachedPosts.length) {
      posts = cachedPosts
      postsCount = await postCache.getPostsCount()
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 })
      postsCount = await postService.getPostsCount()
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Get all posts', posts, postsCount })
  }

  public async plusImage(req: Request, res: Response): Promise<void> {
    const { page } = req.params
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE
    const limit: number = PAGE_SIZE * parseInt(page)
    const start: number = skip === 0 ? skip : skip + 1
    let posts: IPostDocument[] = []
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImages('post', start, limit)
    posts = cachedPosts.length
      ? cachedPosts
      : await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 })

    res.status(HTTP_STATUS.OK).json({ message: 'Get all posts with images', posts })
  }
}
