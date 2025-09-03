import { Test } from '@nestjs/testing'
import { mockDeep } from 'jest-mock-extended'
import { WhitelistController } from '../whitelist.controller'
import { WhitelistService } from 'src/request-classification/services/whitelist.service'
import { WhitelistInput } from 'src/request-classification/dtos/whitelist.input'

describe(WhitelistController, () => {
  let controller: WhitelistController

  const whitelistService = mockDeep<WhitelistService>()

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [WhitelistController],
      providers: [
        {
          provide: WhitelistService,
          useValue: whitelistService,
        },
      ],
    }).compile()

    controller = module.get<WhitelistController>(WhitelistController)
  })

  describe(WhitelistController.prototype.create, () => {
    it('Should call service', async () => {
      // Arrange
      const input: WhitelistInput = {
        ip: '192.168.1.1',
      }

      // Act
      await controller.create(input)

      // Assert
      expect(whitelistService.create).toHaveBeenCalledWith(input.ip)
    })
  })

  describe(WhitelistController.prototype.delete, () => {
    it('Should call service', async () => {
      // Arrange
      const input: WhitelistInput = {
        ip: '192.168.1.1',
      }

      // Act
      await controller.delete(input)

      // Assert
      expect(whitelistService.delete).toHaveBeenCalledWith(input.ip)
    })
  })
})
