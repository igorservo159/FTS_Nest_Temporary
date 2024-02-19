import { Controller, Get } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Get('data')
  async getData(): Promise<any[]> {
    return await this.googleSheetsService.getDataFromGoogleSheet();
  }
}
