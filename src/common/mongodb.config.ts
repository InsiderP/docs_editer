import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

export const MongoDbModule = [
  ConfigModule.forRoot(),
  MongooseModule.forRoot(process.env.MONGO_URL as string),
]; 