import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
// Reference fields use SchemaTypes.ObjectId, never Types.ObjectId: @nestjs/mongoose
// recognises only the former. Given the latter it treats it as a plain class, builds
// an empty definition from it, and the field silently becomes Mixed — which stops
// casting, so ids get stored as raw strings and no longer match id queries.

@Schema({ timestamps: true })
export class Contact {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String, required: true, minlength: 10 })
  message: string;
}

export type ContactDocument = HydratedDocument<Contact>;
export const ContactSchema = SchemaFactory.createForClass(Contact);
