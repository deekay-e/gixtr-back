import mongoose, { model, Model, Schema } from 'mongoose'

import { ICommentDocument } from '@comment/interfaces/comment.interface'

const commentSchema: Schema = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  avataColor: { type: String },
  profilePicture: { type: String },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now() }
})

const CommentModel: Model<ICommentDocument> = model<ICommentDocument>('Comment', commentSchema, 'comments')
export { CommentModel }
