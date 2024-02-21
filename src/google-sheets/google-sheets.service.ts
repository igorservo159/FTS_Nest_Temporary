import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  async getDataFromGoogleSheet() {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.google.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1Cmmk_hHivmSjVAKVEixpq8rFIZTvPp_wngbF44OtmeM';
    const range = 'ENEM!A1:H515';

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const relevanceDictionary = {
        NEN: 0,
        BAI: 1,
        MED: 2,
        ALT: 3,
      };

      const frontDictionary = {
        'Frente A': 1,
        'Frente B': 2,
        'Frente C': 3,
      };

      const [header, ...rows] = response.data.values;
      const data = rows.map((row, index) => {
        const [
          great_topic_id,
          front,
          great_topic_name,
          topic_name,
          class_name,
          relevance,
          percentage,
          total,
        ] = row;
        return {
          id: index + 1,
          great_topic_id,
          front: frontDictionary[front],
          great_topic_name,
          topic_name,
          class_name,
          relevance: relevanceDictionary[relevance],
          percentage,
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
