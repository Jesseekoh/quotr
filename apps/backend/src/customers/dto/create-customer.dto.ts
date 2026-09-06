import { IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  address: string;
}
