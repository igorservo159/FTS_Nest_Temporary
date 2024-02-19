import { PartialType } from '@nestjs/mapped-types';
import { CreateMepDto } from './create-mep.dto';

export class UpdateMepDto extends PartialType(CreateMepDto) {}
