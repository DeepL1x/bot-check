import { ConflictException, Injectable } from '@nestjs/common'

import { BlacklistRepository } from '../repositories/blacklist.repository'
import { WhitelistRepository } from '../repositories/whitelist.repository'

@Injectable()
export class WhitelistService {
  constructor(
    private readonly whitelistRepository: WhitelistRepository,
    private readonly blacklistRepository: BlacklistRepository,
  ) {}

  async create(ip: string) {
    const blackList = await this.blacklistRepository.findUnique(ip)

    if (blackList) {
      throw new ConflictException('The provided ip is blacklisted')
    }

    return this.whitelistRepository.create(ip)
  }

  async delete(ip: string) {
    return this.whitelistRepository.delete(ip)
  }
}
