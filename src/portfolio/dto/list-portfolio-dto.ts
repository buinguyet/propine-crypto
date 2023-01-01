import { IsDateString, IsOptional } from 'class-validator';

export class ListPortfolioDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
