import { Injectable } from '@nestjs/common';
import { CreateMepDto } from './dto/create-mep.dto';
import { UpdateMepDto } from './dto/update-mep.dto';
import { differenceInWeeks } from 'date-fns';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';

@Injectable()
export class MepService {
  constructor(private googleSheetsService: GoogleSheetsService) {}

  async create(createMepDto: CreateMepDto) {
    const listaAulas = await this.googleSheetsService.getDataFromGoogleSheet();

    const data_inicio = new Date(createMepDto.data_inicio);
    const data_termino = new Date(createMepDto.data_termino);

    const weeks = differenceInWeeks(data_inicio, data_termino);

    if (data_inicio >= data_termino) {
      throw new Error(
        'A data de início não pode ser maior ou igual à data de termino',
      );
    }

    const arrayDeGabriel = [];
    let dayIterator = new Date(data_inicio);

    const dicionarioSemana = {
      0: 'Domingo',
      1: 'Segunda',
      2: 'Terça',
      3: 'Quarta',
      4: 'Quinta',
      5: 'Sexta',
      6: 'Sábado',
    };

    function bitsParaArrayDiasSemana(bits) {
      const diasSemana = [];
      for (let i = 0; i < 7; i++) {
        if ((bits >> i) & 1) {
          diasSemana.push(i);
        }
      }
      return diasSemana;
    }

    const diasEscolhidos = bitsParaArrayDiasSemana(createMepDto.dias_semana);

    while (dayIterator <= data_termino) {
      const monthDay = String(dayIterator.getDate()).padStart(2, '0');
      const month = String(dayIterator.getMonth() + 1).padStart(2, '0');
      const weekDay = dayIterator.getDay();

      if (diasEscolhidos.includes(weekDay))
        arrayDeGabriel.push({
          date: `${monthDay}/${month} - ${dicionarioSemana[weekDay]}`,
        });
      dayIterator.setDate(dayIterator.getDate() + 1);
    }

    let aulasPorDia: number;
    let relevancias: number[];

    if (createMepDto.horas_por_dia == 1.5 || createMepDto.horas_por_dia == 2) {
      aulasPorDia = 2;
      relevancias = [2, 3];
    } else if (
      createMepDto.horas_por_dia == 2.5 ||
      createMepDto.horas_por_dia == 3
    ) {
      aulasPorDia = 3;
      relevancias = [1, 2, 3];
    } else if (
      createMepDto.horas_por_dia == 3.5 ||
      createMepDto.horas_por_dia == 4
    ) {
      aulasPorDia = 5;
      relevancias = [1, 2, 3];
    }

    arrayDeGabriel.forEach((element, index) => {
      const content = {};
      for (let i = 0; i < aulasPorDia; i++) {
        let indiceAula = index * aulasPorDia + i;
        if (
          listaAulas.length >= indiceAula &&
          relevancias.includes(listaAulas[indiceAula].relevancia)
        )
          content['aula_' + String(i + 1)] = listaAulas[indiceAula].aula_name;
      }
      element.content = content;
    });

    //return lista[0];

    return arrayDeGabriel;
  }

  findAll() {
    return `This action returns all mep`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mep`;
  }

  update(id: number, updateMepDto: UpdateMepDto) {
    return `This action updates a #${id} mep`;
  }

  remove(id: number) {
    return `This action removes a #${id} mep`;
  }
}
