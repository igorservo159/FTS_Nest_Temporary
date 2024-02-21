import { Injectable } from '@nestjs/common';
import { CreateMepDto } from './dto/create-mep.dto';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';

@Injectable()
export class MepService {
  constructor(private googleSheetsService: GoogleSheetsService) {}

  private weekDictionary = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
  };

  private bitsToDays(bits: number) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if ((bits >> i) & 1) {
        week.push(i);
      }
    }
    return week;
  }

  private classesPerDayAndRelevance(hoursPerDay) {
    let classesPerDay, relevance;

    if (hoursPerDay == 1.5 || hoursPerDay == 2) {
      classesPerDay = 2;
      relevance = [2, 3];
    } else if (hoursPerDay == 2.5 || hoursPerDay == 3) {
      classesPerDay = 3;
      relevance = [1, 2, 3];
    } else if (hoursPerDay == 3.5 || hoursPerDay == 4) {
      classesPerDay = 5;
      relevance = [1, 2, 3];
    }

    return { classesPerDay, relevance };
  }

  private generateSchedule(
    dayIterator: Date,
    endDate: Date,
    chosenDays: number[],
  ) {
    const schedule = [];
    while (dayIterator <= endDate) {
      const monthDay = String(dayIterator.getDate()).padStart(2, '0');
      const month = String(dayIterator.getMonth() + 1).padStart(2, '0');
      const weekDay = dayIterator.getDay();

      if (chosenDays.includes(weekDay))
        schedule.push({
          date: `${monthDay}/${month} - ${this.weekDictionary[weekDay]}`,
        });
      dayIterator.setDate(dayIterator.getDate() + 1);
    }
    return schedule;
  }

  async create(createMepDto: CreateMepDto) {
    const classCollection =
      await this.googleSheetsService.getDataFromGoogleSheet();

    const startDate = new Date(createMepDto.startDate);
    const endDate = new Date(createMepDto.endDate);
    const hoursPerDay = createMepDto.hoursPerDay;

    const { classesPerDay, relevance } =
      this.classesPerDayAndRelevance(hoursPerDay);

    const availableClasses = classCollection.filter((lesson) =>
      relevance.includes(lesson.relevance),
    );

    let dayIterator = new Date(startDate);
    const chosenDays = this.bitsToDays(createMepDto.weekDays);

    const schedule = this.generateSchedule(dayIterator, endDate, chosenDays);

    //Preencher o cronograma

    let index = 0;

    while (index < schedule.length && index < availableClasses.length) {
      const content = {};

      for (let i = 0; i < classesPerDay; i++) {
        content['aula_' + String(index * classesPerDay + i + 1)] =
          availableClasses[index * classesPerDay + i].class_name;
      }

      schedule[index].content = content;

      index++;
    }

    return schedule;
  }
}
