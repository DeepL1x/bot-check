import { ApiProperty } from '@nestjs/swagger'
import { IsIP } from 'class-validator'

export class IpListItem {
  @ApiProperty({ example: '203.0.113.10' })
  @IsIP()
  ip: string
}
