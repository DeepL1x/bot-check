import { Test, TestingModule } from '@nestjs/testing'
import { RequestClassificationService } from '../request-classification.service'
import { WhitelistRepository } from 'src/request-classification/repositories/whitelist.repository'
import { mockDeep } from 'jest-mock-extended'
import { BlacklistRepository } from 'src/request-classification/repositories/blacklist.repository'
import { ConfigModule } from '@nestjs/config'
import config from 'src/common/config'
import { RequestClassificationInput } from 'src/request-classification/dtos/request-classification.input'
import { RequestClassificationOut } from 'src/request-classification/dtos/request-classification.out'
import { Types } from 'mongoose'
import { beforeEach } from 'node:test'
import { NetworkType } from 'src/request-classification/enums/network-type.enum'

describe(RequestClassificationService, () => {
  let service: RequestClassificationService
  const whitelistRepository = mockDeep<WhitelistRepository>()
  const blacklistRepository = mockDeep<BlacklistRepository>()

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config] })],
      providers: [
        RequestClassificationService,
        {
          provide: WhitelistRepository,
          useValue: whitelistRepository,
        },
        {
          provide: BlacklistRepository,
          useValue: blacklistRepository,
        },
      ],
    }).compile()

    service = module.get<RequestClassificationService>(
      RequestClassificationService,
    )
  })

  beforeEach(() => jest.clearAllMocks())

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(RequestClassificationService.prototype.classify, () => {
    it('Should return proper result for whitelisted ip', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
      }
      const whitelist = {
        ip: input.ip,
        _id: new Types.ObjectId(),
        __v: 0,
      }
      whitelistRepository.findUnique.mockResolvedValueOnce(whitelist)

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'human',
        score: 0,
        reasons: [],
      })
    })

    it('Should return proper result for blacklisted ip', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
      }
      const blacklist = {
        ip: input.ip,
        _id: new Types.ObjectId(),
        __v: 0,
      }
      blacklistRepository.findUnique.mockResolvedValueOnce(blacklist)

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'bot',
        score: 1,
        reasons: ['L0: blacklisted'],
      })
    })

    it('Should return proper result for no headers', async () => {
      // Arrange
      const input: RequestClassificationInput = { ip: '123.123.123.123' }

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'human',
        score: config().classification.weights.l1_headers,
        reasons: ['L1: no headers provided (suspicious)'],
      })
    })

    it('Should return proper result for missing user agent', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
        headers: {},
      }

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'human',
        score: config().classification.weights.l1_headers,
        reasons: ['L1: missing User-Agent'],
      })
    })

    it('Should return proper result for bot-like user agent', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
        headers: {
          'user-agent': config().classification.botSignatures[0],
        },
      }

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'human',
        score: config().classification.weights.l1_headers,
        reasons: [
          `L1: bot-like User-Agent (${config().classification.botSignatures[0]})`,
        ],
      })
    })

    it('Should return proper result for missing accept=language', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
        headers: {
          'user-agent': 'default',
        },
      }

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'human',
        score: config().classification.weights.l1_headers,
        reasons: ['L1: missing Accept-Language'],
      })
    })

    it('Should return proper result for hosting network type', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
        headers: {
          'user-agent': 'default',
          'accept-language': 'ua',
        },
        networkType: NetworkType.hosting,
      }

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'human',
        score: config().classification.weights.l2_network_type,
        reasons: ['L2: hosting network type'],
      })
    })

    it('Should return proper result for tor exit node', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
        headers: {
          'user-agent': 'default',
          'accept-language': 'ua',
        },
        tor: true,
      }

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'human',
        score: config().classification.weights.l3_tor_vpn_proxy,
        reasons: ['L3: Tor exit node detected'],
      })
    })

    it.each(['vpn', 'proxy'])(
      'Should return proper result for %s',
      async (value) => {
        // Arrange
        const input: RequestClassificationInput = {
          ip: '123.123.123.123',
          headers: {
            'user-agent': 'default',
            'accept-language': 'ua',
          },
          [value]: true,
        }

        // Act, Assert
        await expect(
          service.classify(input),
        ).resolves.toEqual<RequestClassificationOut>({
          category: 'human',
          score: config().classification.weights.l3_tor_vpn_proxy,
          reasons: ['L3: VPN/Proxy detected'],
        })
      },
    )

    it('Should return proper bot result', async () => {
      // Arrange
      const input: RequestClassificationInput = {
        ip: '123.123.123.123',
        headers: {
          'user-agent': config().classification.botSignatures[0],
          'accept-language': 'ua',
        },
        tor: true,
        networkType: NetworkType.hosting,
      }

      // Act, Assert
      await expect(
        service.classify(input),
      ).resolves.toEqual<RequestClassificationOut>({
        category: 'bot',
        score: 1,
        reasons: [
          `L1: bot-like User-Agent (${config().classification.botSignatures[0]})`,
          'L2: hosting network type',
          'L3: Tor exit node detected',
        ],
      })
    })
  })
})
