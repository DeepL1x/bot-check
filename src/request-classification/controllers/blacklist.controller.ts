import { Controller, Delete, Param, Post } from '@nestjs/common'
import { BlacklistInput } from '../dtos/blacklist.input'
import { BlacklistOut } from '../dtos/blacklist.out'
import { BlacklistService } from '../services/blacklist.service'

@Controller('blacklist')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Post(':ip')
  async create(@Param() input: BlacklistInput): Promise<BlacklistOut> {
    return this.blacklistService.create(input.ip)
  }

  @Delete(':ip')
  async delete(@Param() input: BlacklistInput): Promise<boolean> {
    return this.blacklistService.delete(input.ip)
  }
}
