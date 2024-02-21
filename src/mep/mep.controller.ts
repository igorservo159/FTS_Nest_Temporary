import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
} from '@nestjs/common';
import { MepService } from './mep.service';
import { CreateMepDto } from './dto/create-mep.dto';
import { GSheetPipe } from 'src/gsheet-pipe/gsheet.pipe';

@Controller('mep')
export class MepController {
  constructor(private readonly mepService: MepService) {}

  @Post()
  async create(@Body(new GSheetPipe()) createMepDto: CreateMepDto) {
    try {
      return this.mepService.create(createMepDto);
    } catch (error) {
      return new HttpException(error, 402);
    }
  }
}
