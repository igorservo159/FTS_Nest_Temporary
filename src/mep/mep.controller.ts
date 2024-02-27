import { Controller, Post, Body, HttpException } from '@nestjs/common';
import { MepService } from './mep.service';
import { CreateMepDto } from './dto/create-mep.dto';
//import { GSheetPipe } from 'src/gsheet-pipe/gsheet.pipe';

@Controller('mep')
export class MepController {
  constructor(private readonly mepService: MepService) {}

  @Post()
  async create(@Body() createMepDto: CreateMepDto) {
    console.log(createMepDto);
    try {
      return this.mepService.createMep(createMepDto);
    } catch (error) {
      return new HttpException(error, 400);
    }
  }
}
