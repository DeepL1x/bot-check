import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNumber, IsString } from 'class-validator'

export class RequestClassificationOut {
  @ApiProperty({ enum: ['human', 'bot'] })
  @IsString()
  category: 'human' | 'bot'

  @ApiProperty({
    description: 'confidence coefficient that the requester is a bot',
    type: Number,
  })
  @IsNumber()
  score: number

  @ApiProperty({ type: [String], description: 'reasons of score increase' })
  @IsArray()
  reasons: string[]
}
