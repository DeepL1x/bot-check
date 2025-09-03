import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import supertest from 'supertest'
import { INestApplication } from '@nestjs/common'

describe('HealthController', () => {
  let controller: HealthController
  let app: INestApplication

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile()

    controller = module.get<HealthController>(HealthController)
    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('/GET health', async () => {
    const result = await supertest(app.getHttpServer()).get('/health')
    expect(result.statusCode).toBe(200)
  })
})
