import { ObjectId } from 'mongodb'
import { model, Model, Schema } from 'mongoose'

import { IReactionDocument } from '@reaction/interfaces/reaction.interface'

const reactionSchema: Schema = new Schema({
  postId: { type: ObjectId, ref: 'Post', index: true },
  type: { type: String, default: '' },
  username: { type: String, default: '' },
  avataColor: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() }
})

const ReactionModel: Model<IReactionDocument> = model<IReactionDocument>(
  'Reaction',
  reactionSchema,
  'reactions'
)

export { ReactionModel }
