import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

export interface IFileImageDocument extends Document {
  userId: ObjectId | string
  bgImageVersion: string
  bgImageId: string
  imgId: string
  imgVersion: string
  createdAt: Date
}

export interface IFileImageJob {
  key?: string
  value?: string
  imgId?: string
  imgVersion?: string
  userId?: string
  imageId?: string
}

export interface IBgUploadResponse {
  version: string
  publicId: string
  public_id?: string
}
