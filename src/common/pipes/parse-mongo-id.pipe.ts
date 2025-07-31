// src/common/pipes/parse-mongo-id.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string> {
    transform(value: string) {
        if (!isValidObjectId(value)) {
            throw new BadRequestException('Invalid MongoDB ID');
        }
        return value;
    }
}
