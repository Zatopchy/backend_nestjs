import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('Positive: return version', () => {
      const result = appController.root();
      expect(result).toHaveProperty('version');
      expect(result).toEqual({version: "0.0.1"});
    });
    it('Negative: return version', () => {
      const result = appController.root();
      expect(result).toHaveProperty('version');
      expect(result).not.toEqual({version: "0.0.10"});
    });
  });
});
