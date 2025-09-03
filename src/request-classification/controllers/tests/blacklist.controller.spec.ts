import { Test } from '@nestjs/testing'
import { mockDeep } from 'jest-mock-extended'
import { BlacklistInput } from 'src/request-classification/dtos/blacklist.input'
import { BlacklistService } from 'src/request-classification/services/blacklist.service'

import { BlacklistController } from '../blacklist.controller'

describe(BlacklistController, () => {
  let controller: BlacklistController

  const blacklistService = mockDeep<BlacklistService>()

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BlacklistController],
      providers: [
        {
          provide: BlacklistService,
          useValue: blacklistService,
        },
      ],
    }).compile()

    controller = module.get<BlacklistController>(BlacklistController)
  })

  describe(BlacklistController.prototype.create, () => {
    it('Should call service', async () => {
      // Arrange
      const input: BlacklistInput = {
        ip: '192.168.1.1',
      }

      // Act
      await controller.create(input)

      // Assert
      expect(blacklistService.create).toHaveBeenCalledWith(input.ip)
    })
  })

  describe(BlacklistController.prototype.delete, () => {
    it('Should call service', async () => {
      // Arrange
      const input: BlacklistInput = {
        ip: '192.168.1.1',
      }

      // Act
      await controller.delete(input)

      // Assert
      expect(blacklistService.delete).toHaveBeenCalledWith(input.ip)
    })
  })
})
