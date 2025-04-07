import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Module, Controller, Get } from '@nestjs/common';

@Controller()
class TestController {
  @Get()
  test(): string {
    return 'test';
  }
}

@Module({
  controllers: [TestController],
})
class TestAppModule {}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('test');
  });

  afterEach(async () => {
    await app.close();
  });
});
