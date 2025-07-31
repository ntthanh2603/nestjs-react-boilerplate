import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Images } from './entities/images.entity';
import { MulterModule } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { Global } from '@nestjs/common';
import { LogNestModule } from 'src/log-nest/log-nest.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Images]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      limits: {
        // Limit 100MB
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        // Allow only image files type jpg, jpeg, png
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.jpeg' || ext === '.png' || ext === '.jpg') {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Allow only image files type jpg, jpeg, png!',
            ),
            false,
          );
        }
      },
    }),
    LogNestModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('ImagesModule initialized', ImagesModule.name);
  }
}
