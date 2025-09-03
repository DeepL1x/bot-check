import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsIP,
  IsObject,
  IsOptional,
} from 'class-validator'
import { NetworkType } from '../enums/network-type.enum'

export class RequestClassificationInput {
  @ApiProperty({ example: '203.0.113.10' })
  @IsIP()
  ip: string

  @ApiProperty({ required: false, description: 'HTTP headers object' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, any>

  @ApiProperty({
    required: false,
    description: 'e.g. residential, mobile, hosting, vpn',
  })
  @IsOptional()
  @IsEnum(NetworkType)
  networkType?: NetworkType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  vpn?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  proxy?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  tor?: boolean
}
