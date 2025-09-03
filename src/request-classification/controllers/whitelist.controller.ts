import { Controller, Delete, HttpCode, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { WhitelistInput } from '../dtos/whitelist.input'
import { WhitelistOut } from '../dtos/whitelist.out'
import { WhitelistService } from '../services/whitelist.service'

@ApiTags('Whitelist')
@Controller('whitelist')
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @ApiOperation({
    summary: 'Add IP to whitelist',
    description:
      'Adds a given IP address to the whitelist. Whitelisted IPs are always classified as trusted and bypass further bot checks.',
  })
  @ApiParam({
    name: 'ip',
    description: 'IPv4 or IPv6 address to whitelist',
    example: '192.168.1.100',
  })
  @ApiResponse({
    status: 201,
    description: 'IP successfully added to whitelist',
    type: WhitelistOut,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid IP format',
  })
  @ApiResponse({
    status: 409,
    description: 'Ip is already whitelisted',
  })
  @ApiResponse({
    status: 409,
    description: 'The provided ip is blacklisted',
  })
  @Post(':ip')
  @HttpCode(201)
  async create(@Param() input: WhitelistInput): Promise<WhitelistOut> {
    return this.whitelistService.create(input.ip)
  }

  @ApiOperation({
    summary: 'Delete ip from whitelist',
    description: 'Deletes a given IP address from the whitelist.',
  })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'Ip deleted from whitelist',
  })
  @Delete(':ip')
  async delete(@Param() input: WhitelistInput): Promise<boolean> {
    return this.whitelistService.delete(input.ip)
  }
}
