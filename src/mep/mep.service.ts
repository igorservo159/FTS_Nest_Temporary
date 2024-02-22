/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
/* eslint-enable @typescript-eslint/no-var-requires */

import { Injectable } from '@nestjs/common';
import { CreateMepDto } from './dto/create-mep.dto';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';

type MepClassesDetails = {
  classesPerDay: number;
  minRelevance: number;
};

@Injectable()
export class MepService {
  constructor(private googleSheetsService: GoogleSheetsService) {}

  async createMep(createMepDto: CreateMepDto) {
    //Recuperamos as especificações do usuário para poder criar seu mep.
    const startDate = new Date(createMepDto.startDate);
    const endDate = new Date(createMepDto.endDate);
    const chosenDays = this.bitsToDays(createMepDto.weekDays);

    //criamos a estrutura no mep apenas com as datas.
    const mepScheduleStructure = this.createMepScheduleStructure(
      startDate,
      endDate,
      chosenDays,
    );

    //recuperamos todas as aulas de acordo com a sheet do exame específico passado pelo usuário.
    const entranceExamSheetName = createMepDto.entrance_exam;
    const service = this.googleSheetsService;
    const allClasses = await service.getFormatedData(entranceExamSheetName);

    //calculamos quantas aulas por dia e a relevancia mínima das aulas.
    const { classesPerDay, minRelevance } = this.createMepClassesDetails(
      createMepDto.hoursPerDay,
    );

    //filtramos apenas as aulas que possuem a relevancia mínima.
    const availableClasses = allClasses.filter(
      (lesson) => lesson.relevance >= minRelevance,
    );

    //agrupamos as aulas de acordo com a quantidade de aulas por dia
    //['aula_a', 'aula_b','aula_c','aula_d'] -> [['aula_a', 'aula_b'] ,['aula_c','aula_d']]
    const groupedClasses = availableClasses.reduce((result, item, index) => {
      const linhaAtual = Math.floor(index / classesPerDay);
      if (!result[linhaAtual]) {
        result[linhaAtual] = [];
      }
      result[linhaAtual].push(item);
      return result;
    }, []);

    //redefinimos o tamanho do array de aulas agrupadas e da estrutura do mep para que
    //sejam compatíveis.
    groupedClasses.splice(mepScheduleStructure.length);
    mepScheduleStructure.splice(Math.ceil(groupedClasses.length));

    //adicionamos as aulas ao mep.
    mepScheduleStructure.forEach((element, index) => {
      const classesOfTheDay = groupedClasses[index];
      for (let i = 0; i < classesOfTheDay.length; i++) {
        element['aula_' + String(i + 1)] = classesOfTheDay[i].class_name;
      }
    });

    return mepScheduleStructure;
  }

  private createMepScheduleStructure(
    startDate: Date,
    endDate: Date,
    chosenDays: number[],
  ) {
    const weekDictionary = {
      0: 'Domingo',
      1: 'Segunda',
      2: 'Terça',
      3: 'Quarta',
      4: 'Quinta',
      5: 'Sexta',
      6: 'Sábado',
    };
    const schedule = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthDay = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const weekDay = currentDate.getDay();

      if (chosenDays.includes(weekDay))
        schedule.push({
          date: `${monthDay}/${month} - ${weekDictionary[weekDay]}`,
        });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedule;
  }

  private createMepClassesDetails(hoursPerDay: number): MepClassesDetails {
    let classesPerDay: number;
    let minRelevance: number;
    if (hoursPerDay == 1.5 || hoursPerDay == 2) {
      classesPerDay = 2;
      minRelevance = 2;
    } else if (hoursPerDay == 2.5 || hoursPerDay == 3) {
      classesPerDay = 3;
      minRelevance = 1;
    } else if (hoursPerDay == 3.5 || hoursPerDay == 4) {
      classesPerDay = 5;
      minRelevance = 1;
    }

    return {
      classesPerDay,
      minRelevance,
    };
  }

  private bitsToDays(bits: number) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if ((bits >> i) & 1) {
        week.push(i);
      }
    }
    return week;
  }
}
