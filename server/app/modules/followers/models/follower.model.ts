import { ObjectId } from 'mongodb'
import { model, Model, Schema } from 'mongoose'

import { IFollowerDocument } from '@follower/interfaces/follower.interface'

const followerSchema: Schema = new Schema({
  followerId: { type: ObjectId, ref: 'User', index: true },
  followeeId: { type: ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now() }
})

const FollowerModel: Model<IFollowerDocument> = model<IFollowerDocument>(
  'Follower',
  followerSchema,
  'followers'
)
export { FollowerModel }
