import { Test } from '@nestjs/testing'
import { mockDeep } from 'jest-mock-extended'
import { RequestClassificationInput } from 'src/request-classification/dtos/request-classification.input'
import { RequestClassificationService } from 'src/request-classification/services/request-classification.service'

import { RequestClassificationController } from '../request-classification.controller'

describe(RequestClassificationController, () => {
  let controller: RequestClassificationController

  const requestClassificationService = mockDeep<RequestClassificationService>()

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [RequestClassificationController],
      providers: [
        {
          provide: RequestClassificationService,
          useValue: requestClassificationService,
        },
      ],
    }).compile()

    controller = module.get<RequestClassificationController>(
      RequestClassificationController,
    )
  })

  it('Should call service', async () => {
    // Arrange
    const input: RequestClassificationInput = {
      ip: '192.168.1.1',
    }

    // Act
    await controller.classify(input)

    // Assert
    expect(requestClassificationService.classify).toHaveBeenCalledWith(input)
  })
})
