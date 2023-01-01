import { BadRequestException, Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { DetailPortfolioDto } from './dto/detail-portfolio.dto';
import { ListPortfolioDto } from './dto/list-portfolio-dto';
import { addDayTimestamp, toTimestamp } from '../common/utils';
import axios from 'axios';
import { ResponsePortfolioDto } from './dto/response-portfolio.dto';

@Injectable()
export class PortfolioService {
  async getConvertAmount(token: string, timestamp: string) {
    const API = `${process.env.CRYPTO_COMPARE_API}/data/v2/histoday?api_key=${process.env.CRYPTO_COMPARE_API_KEY}&fsym=${token}&tsym=USD&limit=1&toTs=${timestamp}`;

    const convertAmount = await axios({
      url: API,
      method: 'GET',
    });

    return convertAmount.data;
  }

  async convertAmountData(data: any) {
    const convertData: ResponsePortfolioDto[] = [];

    for (let i = 0; i < data.length; i++) {
      const rsData: ResponsePortfolioDto = { ...data[i] };

      const convertAmount = await this.getConvertAmount(
        data[i].token,
        data[i].timestamp,
      );

      let rate = 1;
      if (convertAmount?.Data?.Data) {
        rate =
          convertAmount?.Data?.Data[convertAmount?.Data?.Data?.length - 1]
            ?.close;
      }

      rsData.amount = Number(data[i].amount) * rate;

      convertData.push(rsData);
    }

    return convertData;
  }

  async getAllLatestPortfolio(filters: ListPortfolioDto) {
    const { date } = filters;
    const result = [];

    const fsStream = fs.createReadStream('template/transactions.csv');
    const csvStream = csv();

    try {
      const data: any = new Promise((resolve) => {
        fsStream
          .pipe(csvStream)
          .on('data', async (row) => {
            if (date) {
              const startTimestamp = toTimestamp(date);
              const endTimestamp = addDayTimestamp(startTimestamp);

              if (
                Number(row['timestamp']) >= startTimestamp &&
                Number(row['timestamp']) <= endTimestamp
              ) {
                result.push(row);
              } else {
                csvStream.end();
              }
            } else {
              const findItem = result.findIndex(
                (i) => i.token === row['token'],
              );
              if (findItem === -1) {
                if (row.token) {
                  result.push(row);
                }
              } else {
                csvStream.end();
              }
            }

            resolve(result);
          })
          .on('end', () => {
            console.log('CSV file successfully processed');
            resolve(true);
          });
      }).then(async (result) => {
        return await this.convertAmountData(result);
      });

      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getByTokenAndDate(filters: DetailPortfolioDto) {
    const { token, date } = filters;

    const fsStream = fs.createReadStream('template/transactions.csv');
    const csvStream = csv();

    try {
      const result = [];

      const data = new Promise((resolve) => {
        fsStream
          .pipe(csvStream)
          .on('data', async (row) => {
            if (!date && row['token'] === token) {
              const findItem = result.findIndex(
                (i) => i.token === row['token'],
              );

              if (findItem === -1) {
                result.push(row);
              } else {
                csvStream.end();
              }
            } else if (date && row['token'] === token) {
              const startTimestamp = toTimestamp(date);
              const endTimestamp = addDayTimestamp(startTimestamp);

              if (
                Number(row['timestamp']) >= startTimestamp &&
                Number(row['timestamp']) <= endTimestamp
              ) {
                result.push(row);
              } else {
                csvStream.end();
              }
            }

            resolve(result);
          })
          .on('end', () => {
            console.log('CSV file successfully processed');
            resolve(true);
          });
      }).then(async (result) => {
        return await this.convertAmountData(result);
      });

      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
