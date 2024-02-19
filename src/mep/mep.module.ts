import { Module } from '@nestjs/common';
import { MepService } from './mep.service';
import { MepController } from './mep.controller';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';

@Module({
  controllers: [MepController],
  providers: [MepService, GoogleSheetsService],
})
export class MepModule {}
