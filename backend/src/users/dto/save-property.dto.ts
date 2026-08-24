import { IsUUID } from 'class-validator';

export class SavePropertyDto {
  @IsUUID()
  propertyId!: string;
}
