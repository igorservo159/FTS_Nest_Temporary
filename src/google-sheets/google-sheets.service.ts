/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
/* eslint-enable @typescript-eslint/no-var-requires */

import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  async getDataFromGoogleSheet() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLEAPI_CREDENTIALS,
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'ENEM!A1:H515';

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const dicionarioRelevacia = {
        NEN: 0,
        BAI: 1,
        MED: 2,
        ALT: 3,
      };

      const dicionarioFrente = {
        'Frente A': 1,
        'Frente B': 2,
        'Frente C': 3,
      };

      const [header, ...rows] = response.data.values;
      const data = rows.map((row, index) => {
        const [
          grande_topico_id,
          frente,
          grande_topico_name,
          topico_name,
          aula_name,
          relevancia,
          percentual,
          total,
        ] = row;
        return {
          id: index + 1,
          grande_topico_id,
          frente: dicionarioFrente[frente],
          grande_topico_name,
          topico_name,
          aula_name,
          relevancia: dicionarioRelevacia[relevancia],
          percentual,
          total,
        };
      });

      return data;
    } catch (err) {
      console.error('Erro ao obter dados da planilha:', err);
      throw err;
    }
  }
}
