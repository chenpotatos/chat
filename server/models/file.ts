import {
  getModelForClass,
  prop,
  DocumentType,
  Ref,
  modelOptions,
  Severity,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';
import { User } from './user/user';

/**
 * 聊天会话
 */
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class File extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop()
  etag: string;

  @prop({ ref: () => User })
  userId?: Ref<User>;

  @prop()
  bucketName: string;

  @prop()
  objectName: string;

  @prop()
  url: string;

  /**
   * 文件大小, 单位: Byte
   */
  @prop()
  size: number;

  @prop()
  metaData: object;
}

export type FileDocument = DocumentType<File>;

const model = getModelForClass(File);

export type FileModel = typeof model;

export default model;
