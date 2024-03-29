import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GoogleSheetsService } from './google-sheets/google-sheets.service';
import { GoogleSheetsController } from './google-sheets/google-sheets.controller';
import { MepModule } from './mep/mep.module';
import { FirebaseAuthStrategy } from './auth/firebase.strategy';
import { FirestoreService } from './firestore/firestore.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MepModule,
    /*TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'FTS_teste',
      entities: [Mep],
      synchronize: false,
    }),*/
  ],
  controllers: [AppController, GoogleSheetsController],
  providers: [
    AppService,
    GoogleSheetsService,
    FirebaseAuthStrategy,
    FirestoreService,
  ],
})
export class AppModule {}
