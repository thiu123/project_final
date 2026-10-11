import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, minlength: 3, maxlength: 50 })
  username?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: false, select: false })
  password?: string;

  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;

  @Prop({ type: String, default: null })
  avatar_url: string | null;

  @Prop({ type: Boolean, default: false })
  admin: boolean;

  @Prop({ type: String, default: null, select: false })
  resetPasswordToken: string | null;

  @Prop({ type: Date, default: null, select: false })
  resetPasswordExpires: Date | null;

  @Prop({ type: Number, default: 0, select: false })
  tokenVersion: number;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
