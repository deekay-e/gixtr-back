import { ObjectId } from 'mongodb'
import { model, Model, Schema } from 'mongoose'

import { IFileImageDocument } from '@image/interfaces/image.interface'

const imageSchema: Schema = new Schema({
  userId: { type: ObjectId, ref: 'User', index: true },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  imgId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
})

const ImageModel: Model<IFileImageDocument> = model<IFileImageDocument>(
  'Image',
  imageSchema,
  'images'
)
export { ImageModel }
