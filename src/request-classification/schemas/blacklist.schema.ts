import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class Blacklist {
  @Prop({ required: true, index: true, unique: true })
  ip: string
}
export const BlacklistSchema = SchemaFactory.createForClass(Blacklist)
