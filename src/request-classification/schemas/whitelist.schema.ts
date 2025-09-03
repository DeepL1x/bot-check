import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class Whitelist {
  @Prop({ required: true, index: true, unique: true })
  ip: string
}
export const WhitelistSchema = SchemaFactory.createForClass(Whitelist)
