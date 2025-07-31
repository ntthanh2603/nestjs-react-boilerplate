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
import { LogNestService } from 'src/log-nest/log-nest.service';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly logNestService: LogNestService,
  ) {}

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
  async updateAvatarMember(
    @Member() member: IMember,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.imagesService.updateAvatarMember(file, member);
    await this.logNestService.createLog({
      action: 'Cập nhật ảnh đại diện',
      context: 'IMAGES',
      details: {
        memberId: member.id,
        url: result.url,
        description: result.description,
      },
      memberId: member.id,
      status: 'SUCCESS',
    });
    return result;
  }
}
