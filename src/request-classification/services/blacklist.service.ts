import { ConflictException, Injectable } from '@nestjs/common'

import { BlacklistRepository } from '../repositories/blacklist.repository'
import { WhitelistRepository } from '../repositories/whitelist.repository'

@Injectable()
export class BlacklistService {
  constructor(
    private readonly whitelistRepository: WhitelistRepository,
    private readonly blacklistRepository: BlacklistRepository,
  ) {}

  async create(ip: string) {
    const blackList = await this.whitelistRepository.findUnique(ip)

    if (blackList) {
      throw new ConflictException('The provided ip is whitelisted')
    }

    return this.blacklistRepository.create(ip)
  }

  async delete(ip: string) {
    return this.blacklistRepository.delete(ip)
  }
}
