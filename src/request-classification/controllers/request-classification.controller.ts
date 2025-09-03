import { Body, Controller, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { RequestClassificationInput } from '../dtos/request-classification.input'
import { RequestClassificationOut } from '../dtos/request-classification.out'
import { RequestClassificationService } from '../services/request-classification.service'

@ApiTags('Classification')
@Controller('classify')
export class RequestClassificationController {
  constructor(
    private readonly requestClassificationService: RequestClassificationService,
  ) {}

  @ApiOperation({
    summary: 'Classify request origin',
    description:
      'Analyzes network attributes and headers to decide if the request is from a human or a bot.',
  })
  @ApiBody({
    type: RequestClassificationInput,
    description: 'Input attributes for classification.',
    examples: {
      normalBrowser: {
        summary: 'Typical human request',
        value: {
          ip: '192.168.1.10',
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'accept-language': 'en-US,en;q=0.9',
          },
          networkType: 'residential',
          vpn: false,
          proxy: false,
          tor: false,
        },
      },
      suspiciousBot: {
        summary: 'Bot-like request',
        value: {
          ip: '203.0.113.50',
          headers: {
            'user-agent': 'python-requests/2.28',
          },
          networkType: 'hosting',
          vpn: true,
          proxy: false,
          tor: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Classification result with score and reasons.',
    type: RequestClassificationOut,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @Post()
  async classify(
    @Body() input: RequestClassificationInput,
  ): Promise<RequestClassificationOut> {
    return this.requestClassificationService.classify(input)
  }
}
