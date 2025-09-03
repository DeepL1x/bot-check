import { Controller, Delete, Param, Post } from '@nestjs/common'

import { WhitelistInput } from '../dtos/whitelist.input'
import { WhitelistOut } from '../dtos/whitelist.out'
import { WhitelistService } from '../services/whitelist.service'

@Controller('whitelist')
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Post(':ip')
  async create(@Param() input: WhitelistInput): Promise<WhitelistOut> {
    return this.whitelistService.create(input.ip)
  }

  @Delete(':ip')
  async delete(@Param() input: WhitelistInput): Promise<boolean> {
    return this.whitelistService.delete(input.ip)
  }
}
