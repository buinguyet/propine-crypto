import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class DetailPortfolioDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
