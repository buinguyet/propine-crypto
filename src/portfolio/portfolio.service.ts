import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { DetailPortfolioDto } from './dto/detail-portfolio.dto';
import { ListPortfolioDto } from './dto/list-portfolio-dto';
import { addDayTimestamp, toTimestamp } from '../common/utils';

@Injectable()
export class PortfolioService {
  getAllLatestPortfolio(filters: ListPortfolioDto) {
    const { date } = filters;
    const result = [];

    const fsStream = fs.createReadStream('template/transactions.csv');
    const csvStream = csv();

    const data = new Promise((resolve) => {
      fsStream
        .pipe(csvStream)
        .on('data', (row) => {
          const convertAmount = 10000;
          if (date) {
            const startTimestamp = toTimestamp(date);
            const endTimestamp = addDayTimestamp(startTimestamp);

            if (
              Number(row['timestamp']) >= startTimestamp &&
              Number(row['timestamp']) <= endTimestamp
            ) {
              result.push({
                ...row,
                amount: row['amount'] * convertAmount,
              });
            } else {
              csvStream.end();
            }
          } else {
            const findItem = result.findIndex((i) => i.token === row['token']);
            if (findItem === -1) {
              if (row.token) {
                result.push({ ...row, amount: row['amount'] * convertAmount });
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
    });

    return data;
  }

  getByTokenAndDate(filters: DetailPortfolioDto) {
    const { token, date } = filters;

    const fsStream = fs.createReadStream('template/transactions.csv');
    const csvStream = csv();

    const result = [];

    const data = new Promise((resolve) => {
      fsStream
        .pipe(csvStream)
        .on('data', async (row) => {
          if (!date && row['token'] === token) {
            const findItem = result.findIndex((i) => i.token === row['token']);

            if (findItem === -1) {
              const convertAmount = 10000;
              result.push({ ...row, amount: row['amount'] * convertAmount });
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
              const convertAmount = 10000;
              result.push({ ...row, amount: row['amount'] * convertAmount });
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
    });

    return data;
  }
}
