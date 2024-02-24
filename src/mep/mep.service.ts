/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
/* eslint-enable @typescript-eslint/no-var-requires */

import { Injectable } from '@nestjs/common';
import { CreateMepDto } from './dto/create-mep.dto';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';
import { differenceInWeeks } from 'date-fns';
import { readFileSync } from 'fs';

interface MepClassesDetails {
  classesPerDay: number;
  minRelevance: number;
}

interface MepLogicScenario {
  weeksRange: [number, number];
  conditions: {
    daysPerWeek: number[];
    subconditions: {
      hoursPerDay: number[];
      classesPerDay: number;
      minRelevance: number;
    }[];
  }[];
}

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

    //calculamos o número de semanas
    const weeksCount = this.countWeeksBetweenDates(startDate, endDate);

    //calculamos quantas aulas por dia e a relevancia mínima das aulas.
    const { classesPerDay, minRelevance } = this.createMepClassesDetails(
      weeksCount,
      chosenDays.length,
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

  private createMepClassesDetails(
    weeksCount: number,
    daysPerWeek: number,
    hoursPerDay: number,
  ): MepClassesDetails {
    const mepLogicPath = process.env.MEP_LOGIC;
    const mepLogicData = readFileSync(mepLogicPath, 'utf-8');
    const mepLogic: MepLogicScenario[] = JSON.parse(mepLogicData);

    // Encontre o cenário apropriado com base no intervalo de semanas
    const relevantScenario = mepLogic.find((scenario) => {
      const [minWeeks, maxWeeks] = scenario.weeksRange;
      return weeksCount > minWeeks && weeksCount <= maxWeeks;
    });

    if (!relevantScenario) {
      throw new Error('Prazo de semanas inválido');
    }

    // Encontre a condição apropriada com base nos dias por semana
    const relevantCondition = relevantScenario.conditions.find((condition) =>
      condition.daysPerWeek.includes(daysPerWeek),
    );

    if (!relevantCondition) {
      throw new Error('Número inválido de dias por semana');
    }

    // Encontre a subcondição apropriada com base nas horas por dia
    const relevantSubcondition = relevantCondition.subconditions.find(
      (subcondition) => subcondition.hoursPerDay.includes(hoursPerDay),
    );

    if (!relevantSubcondition) {
      throw new Error('Combinação inválida de horas por dia');
    }

    return {
      classesPerDay: relevantSubcondition.classesPerDay,
      minRelevance: relevantSubcondition.minRelevance,
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

  private countWeeksBetweenDates(startDate: Date, endDate: Date): number {
    const weeks = differenceInWeeks(endDate, startDate);
    return weeks;
  }
}
