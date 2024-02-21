import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { validate } from 'class-validator';

import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class GSheetPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);

    object.startDate = new Date(object.startDate);
    object.endDate = new Date(object.endDate);

    if (object.endDate <= object.startDate) {
      throw new BadRequestException(
        'A data de término deve ser maior que a data de início',
      );
    }

    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
