import { Body, Controller, Post } from '@nestjs/common'
import { RequestClassificationService } from '../services/request-classification.service'
import { RequestClassificationOut } from '../dtos/request-classification.out'
import { RequestClassificationInput } from '../dtos/request-classification.input'

@Controller('classify')
export class RequestClassificationController {
  constructor(
    private readonly requestClassificationService: RequestClassificationService,
  ) {}

  @Post()
  async classify(
    @Body() input: RequestClassificationInput,
  ): Promise<RequestClassificationOut> {
    return this.requestClassificationService.classify(input)
  }
}
