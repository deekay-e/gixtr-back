import { ObjectId } from 'mongodb'
import { model, Model, Schema } from 'mongoose'

import { IPostDocument } from '@post/interfaces/post.interface'

const postSchema: Schema = new Schema({
  userId: { type: ObjectId, ref: 'User', index: true },
  username: { type: String },
  email: { type: String },
  avatarColor: { type: String },
  profilePicture: { type: String },
  post: { type: String, default: '' },
  bgColor: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  imgId: { type: String, default: '' },
  feelings: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  scope: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
})

const PostModel: Model<IPostDocument> = model<IPostDocument>('Post', postSchema, 'posts')

export { PostModel }
