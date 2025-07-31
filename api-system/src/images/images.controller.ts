import {
  Controller,
  Patch,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { Doc } from 'src/common/doc/doc.decorator';
import { Images } from './entities/images.entity';
import { ApiTags } from '@nestjs/swagger';
import { Member } from 'src/common/decorators/app.decorator';
import { IMember } from 'src/common/interfaces/app.interface';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Doc({
    summary: 'Update avatar member, Role: Member',
    description: 'Update avatar member',
    response: {
      serialization: Images,
    },
  })
  @Patch('/update-avatar-member')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  @UseInterceptors(FileInterceptor('file'))
  updateAvatarMember(
    @Member() member: IMember,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.updateAvatarMember(file, member);
  }
}
