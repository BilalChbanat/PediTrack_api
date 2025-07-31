// src/families/dto/create-family.dto.ts
import { IsString, IsNotEmpty, IsArray, IsOptional, MinLength, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFamilyDto {
    readonly familyName: string;
    readonly parentId: string[]; // Array but will only contain one element
    readonly children?: string[];
}