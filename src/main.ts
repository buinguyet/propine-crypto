import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as BodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import * as decompress from 'decompress';
import * as fs from 'fs';
import axios from 'axios';

async function downloadTemplate() {
  if (!fs.existsSync('template/')) {
    fs.mkdirSync('template/');
  }

  const writer = fs.createWriteStream('template/transactions.zip');

  const response = await axios({
    url: 'https://s3-ap-southeast-1.amazonaws.com/static.propine.com/transactions.csv.zip',
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function unzip() {
  decompress('template/transactions.zip', 'template')
    .then((files) => {
      console.log('finish unzip files');
    })
    .catch((error) => {
      console.log(error);
    });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(BodyParser.urlencoded({ extended: false }));
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidUnknownValues: false }),
  );

  if (fs.existsSync('template/transactions.zip')) {
    console.log('file exist');
  } else {
    await downloadTemplate();
    unzip();
  }

  await app.listen(8900);
}
bootstrap();
