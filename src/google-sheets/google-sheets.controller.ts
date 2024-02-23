import { Controller, Get, Param } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Get('classes/:sheet_name')
  async getData(@Param('sheet_name') sheet_name: string): Promise<any[]> {
    return await this.googleSheetsService.getFormatedData(sheet_name);
  }
}