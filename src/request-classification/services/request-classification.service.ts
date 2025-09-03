import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClassificationConfigType } from 'src/common/config'

import { RequestClassificationInput } from '../dtos/request-classification.input'
import { RequestClassificationOut } from '../dtos/request-classification.out'
import { NetworkType } from '../enums/network-type.enum'
import { BlacklistRepository } from '../repositories/blacklist.repository'
import { WhitelistRepository } from '../repositories/whitelist.repository'

@Injectable()
export class RequestClassificationService {
  private classificationConfig: ClassificationConfigType
  constructor(
    private readonly blacklistRepository: BlacklistRepository,
    private readonly whitelistRepository: WhitelistRepository,
    private readonly configService: ConfigService,
  ) {
    this.classificationConfig = this.configService.getOrThrow('classification')
  }

  async classify(
    dto: RequestClassificationInput,
  ): Promise<RequestClassificationOut> {
    const weights = this.classificationConfig.weights
    const reasons: string[] = []
    let score = 0

    // L0 - whitelist/blacklist checks
    const isBlacklisted = await this.checkBlackList(dto.ip)
    const isWhitelisted = await this.checkWhiteList(dto.ip)

    if (isBlacklisted) {
      return { category: 'bot', score: 1.0, reasons: ['L0: blacklisted'] }
    }
    if (isWhitelisted) {
      return { category: 'human', score: 0.0, reasons: [] }
    }

    // L1 - HTTP header consistency
    const l1 = this.evaluateHeaders(dto.headers)
    if (l1.suspicious) {
      score += weights.l1_headers
      reasons.push(...l1.reasons)
    }

    // L2 - network type
    if (dto.networkType === NetworkType.hosting) {
      score += weights.l2_network_type
      reasons.push('L2: hosting network type')
    }

    // L3 - VPN / Proxy / Tor
    if (dto.tor || dto.vpn || dto.proxy) {
      score += weights.l3_tor_vpn_proxy
      if (dto.tor) {
        reasons.push('L3: Tor exit node detected')
      } else {
        reasons.push('L3: VPN/Proxy detected')
      }
    }

    // final decision
    let category: RequestClassificationOut['category'] = 'human'
    if (score >= this.classificationConfig.botThreshold) {
      category = 'bot'
    }

    return { category, score: Number(score.toFixed(2)), reasons }
  }

  private async checkWhiteList(ip: string): Promise<boolean> {
    const whiteListed = await this.whitelistRepository.findUnique(ip)

    return !!whiteListed
  }

  private async checkBlackList(ip: string): Promise<boolean> {
    const blackListed = await this.blacklistRepository.findUnique(ip)

    return !!blackListed
  }

  private evaluateHeaders(headers?: Record<string, unknown>): {
    suspicious: boolean
    reasons: string[]
  } {
    const botSignatures = this.classificationConfig.botSignatures
    const reasons: string[] = []

    if (!headers) {
      reasons.push('L1: no headers provided (suspicious)')
      return { suspicious: true, reasons }
    }

    const uaValue = headers['user-agent'] ?? headers['User-Agent']
    let ua: string | undefined

    if (typeof uaValue === 'string') {
      ua = uaValue.toLowerCase()
    }

    if (!ua) {
      reasons.push('L1: missing User-Agent')
      return { suspicious: true, reasons }
    }

    // common bot UA markers
    for (const sig of botSignatures) {
      if (ua.includes(sig)) {
        reasons.push(`L1: bot-like User-Agent (${sig})`)
        return { suspicious: true, reasons }
      }
    }

    // check Accept-Language presence
    const acceptLang = headers['accept-language'] || headers['Accept-Language']
    if (!acceptLang) reasons.push('L1: missing Accept-Language')

    return { suspicious: reasons.length > 0, reasons }
  }
}
