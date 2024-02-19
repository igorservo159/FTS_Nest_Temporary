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
import { UpdateMepDto } from './dto/update-mep.dto';

@Controller('mep')
export class MepController {
  constructor(private readonly mepService: MepService) {}

  @Post()
  create(@Body() createMepDto: CreateMepDto) {
    try {
      return this.mepService.create(createMepDto);
    } catch (error) {
      return new HttpException(error, 402);
    }
  }

  @Get()
  findAll() {
    return this.mepService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mepService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMepDto: UpdateMepDto) {
    return this.mepService.update(+id, updateMepDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mepService.remove(+id);
  }
}
