/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
/* eslint-enable @typescript-eslint/no-var-requires */

import { Injectable } from '@nestjs/common';
import { CreateMepDto } from './dto/create-mep.dto';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';
import { differenceInWeeks } from 'date-fns';
import { readFileSync } from 'fs';

interface MepClassesDetails {
  lessonsPerDay: number;
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

  async createRecommendedClassesArray(createMepDto: CreateMepDto) {
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
    const allLessons = await service.getFormatedData(entranceExamSheetName);

    //calculamos o número de semanas
    const weeksCount = this.countWeeksBetweenDates(startDate, endDate);

    //calculamos quantas aulas por dia e a relevancia mínima das aulas.
    const { lessonsPerDay, minRelevance } = this.createMepClassesDetails(
      weeksCount,
      chosenDays.length,
      createMepDto.hoursPerDay,
    );

    const recommendedLessonsCount = lessonsPerDay * mepScheduleStructure.length;
    const highRelevanceLessons = allLessons.filter(
      (lesson) => lesson.relevance == 3,
    );
    const mediumRelevanceLessons = allLessons.filter(
      (lesson) => lesson.relevance == 2,
    );
    const lowRelevanceLessons = allLessons.filter(
      (lesson) => lesson.relevance == 1,
    );

    let recommendedLessons = [];

    if (highRelevanceLessons.length >= recommendedLessonsCount) {
      recommendedLessons = highRelevanceLessons.slice(
        0,
        recommendedLessonsCount,
      );
    } else if (
      highRelevanceLessons.length + mediumRelevanceLessons.length >
      recommendedLessonsCount
    ) {
      const highLessonsCount = highRelevanceLessons.length;
      const mediumLessonsCount = recommendedLessonsCount - highLessonsCount;
      const classesPerFront = this.getClassesPerFront(
        mediumRelevanceLessons,
        mediumLessonsCount,
      );
      let mediumIterator = 0;
      let highIterator = 0;
      let AFrontIterator = 0;
      let BFrontIterator = 0;
      let CFrontIterator = 0;

      for (let i = 0; i < allLessons.length; i++) {
        let lesson = allLessons[i];
        if (
          (lesson.relevance === 2 && mediumIterator < mediumLessonsCount) ||
          (lesson.relevance === 3 && highIterator < highLessonsCount)
        ) {
          if (lesson.relevance === 2) {
            if (lesson.front == 1 && AFrontIterator < classesPerFront.frontA) {
              AFrontIterator++;
              mediumIterator++;
            } else if (
              lesson.front == 2 &&
              BFrontIterator < classesPerFront.frontB
            ) {
              BFrontIterator++;
              mediumIterator++;
            } else if (
              lesson.front == 3 &&
              CFrontIterator < classesPerFront.frontC
            ) {
              CFrontIterator++;
              mediumIterator++;
            }
          } else if (lesson.relevance === 3) {
            highIterator++;
          }
          recommendedLessons.push(lesson);
        }
      }
    } else if (
      highRelevanceLessons.length +
        mediumRelevanceLessons.length +
        lowRelevanceLessons.length >=
      recommendedLessonsCount
    ) {
      const highLessonsCount = highRelevanceLessons.length;
      const mediumLessonsCount = mediumRelevanceLessons.length;
      const lowLessonsCount =
        recommendedLessonsCount - highLessonsCount - mediumLessonsCount;
      const classesPerFront = this.getClassesPerFront(
        lowRelevanceLessons,
        lowLessonsCount,
      );
      let lowIterator = 0;
      let mediumIterator = 0;
      let highIterator = 0;
      let AFrontIterator = 0;
      let BFrontIterator = 0;
      let CFrontIterator = 0;

      for (let i = 0; i < allLessons.length; i++) {
        let lesson = allLessons[i];
        if (
          (lesson.relevance === 1 && lowIterator < lowLessonsCount) ||
          (lesson.relevance === 2 && mediumIterator < mediumLessonsCount) ||
          (lesson.relevance === 3 && highIterator < highLessonsCount)
        ) {
          if (lesson.relevance === 1) {
            if (lesson.front == 1 && AFrontIterator < classesPerFront.frontA) {
              AFrontIterator++;
              lowIterator++;
            } else if (
              lesson.front == 2 &&
              BFrontIterator < classesPerFront.frontB
            ) {
              BFrontIterator++;
              lowIterator++;
            } else if (
              lesson.front == 3 &&
              CFrontIterator < classesPerFront.frontC
            ) {
              CFrontIterator++;
              lowIterator++;
            }
          } else if (lesson.relevance === 2) {
            mediumIterator++;
          } else if (lesson.relevance === 3) {
            highIterator++;
          }
          recommendedLessons.push(lesson);
        }
      }
    }

    return recommendedLessons;
  }

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
    const { lessonsPerDay, minRelevance } = this.createMepClassesDetails(
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
      const linhaAtual = Math.floor(index / lessonsPerDay);
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
      lessonsPerDay: relevantSubcondition.classesPerDay,
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

  private getClassesPerFront(anyRelevanceLessons, anyLessonsCount) {
    const frontALessons = anyRelevanceLessons.filter(
      (lesson) => lesson.front == 1,
    );
    const frontBLessons = anyRelevanceLessons.filter(
      (lesson) => lesson.front == 2,
    );
    const frontCLessons = anyRelevanceLessons.filter(
      (lesson) => lesson.front == 3,
    );

    const proportionFrontALessons =
      frontALessons.length / anyRelevanceLessons.length;
    const proportionFrontBLessons =
      frontBLessons.length / anyRelevanceLessons.length;
    const proportionFrontCLessons =
      frontCLessons.length / anyRelevanceLessons.length;

    // Divide o número de aulas de relevância média em três partes proporcionais
    const classesPerFront = {
      frontA: Math.round(anyLessonsCount * proportionFrontALessons),
      frontB: Math.round(anyLessonsCount * proportionFrontBLessons),
      frontC: Math.round(anyLessonsCount * proportionFrontCLessons),
    };

    const totalAdjusted =
      classesPerFront.frontA + classesPerFront.frontB + classesPerFront.frontC;
    const adjustment = anyLessonsCount - totalAdjusted;
    if (adjustment !== 0) {
      // Adiciona o ajuste ao maior valor proporcional
      if (adjustment > 0) {
        const frontsArray = ['frontA', 'frontB', 'frontC'];
        const largestFront = frontsArray.reduce((prev, curr) => {
          return classesPerFront[prev] > classesPerFront[curr] ? prev : curr;
        });
        classesPerFront[largestFront] += adjustment;
      } else {
        // Subtrai o ajuste do menor valor proporcional
        const frontsArray = ['frontA', 'frontB', 'frontC'];
        const smallestFront = frontsArray.reduce((prev, curr) => {
          return classesPerFront[prev] < classesPerFront[curr] ? prev : curr;
        });
        classesPerFront[smallestFront] += adjustment;
      }
    }

    return classesPerFront;
  }
}
