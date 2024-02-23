/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
/* eslint-enable @typescript-eslint/no-var-requires */

import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ClassFromSheetDto } from './dto/class-from-sheet.dto';

@Injectable()
export class GoogleSheetsService {
  async getFormatedData(sheetName: string) {
    const classBruteTable = await this.getBruteTableFromGooleSheet(
      sheetName,
      process.env.ENEM_SHEET_RANGE,
    );

    return this.bruteTableToClassArray(classBruteTable);
  }

  private async getBruteTableFromGooleSheet(
    sheetName: string,
    range: string,
  ): Promise<any[][]> {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLEAPI_CREDENTIALS,
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!${range}`,
      });
      return response.data.values;
    } catch (err) {
      console.error('Erro ao obter dados da planilha:', err);
      throw err;
    }
  }

  private bruteTableToClassArray(table: any[][]): ClassFromSheetDto[] {
    const [header, ...rows] = table;
    return rows.map((row, index) => {
      return new ClassFromSheetDto(index, row);
    });
  }
}
