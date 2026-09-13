import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Contact {
  // Reference fields must use SchemaTypes.ObjectId; with Types.ObjectId
  // @nestjs/mongoose turns the field into Mixed and ids stop casting.
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, required: true, minlength: 10 })
  message: string;
}

export type ContactDocument = HydratedDocument<Contact>;
export const ContactSchema = SchemaFactory.createForClass(Contact);
