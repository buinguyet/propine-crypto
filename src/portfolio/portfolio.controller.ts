import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { DetailPortfolioDto } from './dto/detail-portfolio.dto';
import { ListPortfolioDto } from './dto/list-portfolio-dto';
import { TransformInterceptor } from 'src/interceptor/transformReq.interceptor';

@UseInterceptors(TransformInterceptor)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  /**
   * Get all
   * @returns array
   */
  @Get()
  getAllLatestPortfolio(@Query() filters: ListPortfolioDto) {
    return this.portfolioService.getAllLatestPortfolio(filters);
  }

  /**
   * Get portfoli by token or date
   * @param token
   * @returns array
   */
  @Get('/detail')
  getByTokenAndDate(@Query() filters: DetailPortfolioDto) {
    return this.portfolioService.getByTokenAndDate(filters);
  }
}
