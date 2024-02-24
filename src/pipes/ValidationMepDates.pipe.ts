import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { CreateMepDto } from 'src/mep/dto/create-mep.dto';

@Injectable()
export class ValidateMepDatesPipe implements PipeTransform {
  transform(value: CreateMepDto, metadata: ArgumentMetadata) {
    if (value.endDate <= value.startDate) {
      throw new BadRequestException('End date must be greater than start date');
    }
    return value;
  }
}
