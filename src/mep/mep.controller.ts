import {
  Controller,
  Post,
  Body,
  HttpException,
  UsePipes,
} from '@nestjs/common';
import { MepService } from './mep.service';
import { CreateMepDto } from './dto/create-mep.dto';
import { ValidateMepDatesPipe } from 'src/pipes/ValidationMepDates.pipe';

@Controller('mep')
export class MepController {
  constructor(private readonly mepService: MepService) {}

  @Post()
  @UsePipes(new ValidateMepDatesPipe())
  async create(@Body() createMepDto: CreateMepDto) {
    console.log(createMepDto);
    try {
      return this.mepService.createMep(createMepDto);
    } catch (error) {
      return new HttpException(error, 402);
    }
  }
}
