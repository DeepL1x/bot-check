import { Controller, Delete, HttpCode, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BlacklistInput } from '../dtos/blacklist.input'
import { BlacklistOut } from '../dtos/blacklist.out'
import { BlacklistService } from '../services/blacklist.service'

@ApiTags('Blacklist')
@Controller('blacklist')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @ApiOperation({
    summary: 'Add IP to blacklist',
    description:
      'Adds a given IP address to the blacklist. Blacklisted IPs are automatically classified as untrusted and blocked from accessing protected resources.',
  })
  @ApiParam({
    name: 'ip',
    description: 'IPv4 or IPv6 address to blacklist',
    example: '203.0.113.42',
  })
  @ApiResponse({
    status: 201,
    description: 'IP successfully added to blacklist',
    type: BlacklistOut,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid IP format',
  })
  @ApiResponse({
    status: 409,
    description: 'Ip is already blacklisted',
  })
  @ApiResponse({
    status: 409,
    description: 'The provided ip is whitelisted',
  })
  @Post(':ip')
  @HttpCode(201)
  async create(@Param() input: BlacklistInput): Promise<BlacklistOut> {
    return this.blacklistService.create(input.ip)
  }

  @ApiOperation({
    summary: 'Delete ip from blacklist',
    description: 'Deletes a given IP address from the blacklist.',
  })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: 'Ip deleted from blacklist',
  })
  @Delete(':ip')
  async delete(@Param() input: BlacklistInput): Promise<boolean> {
    return this.blacklistService.delete(input.ip)
  }
}
