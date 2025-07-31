import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as Minio from 'minio';
import * as fs from 'fs';
import { Images } from './entities/images.entity';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { DefaultMessageResponseDto } from 'src/common/dtos/default-message-response.dto';
import { type UploadImageMetaData } from './images.interface';
import { LinkType } from 'src/common/enums/enum';
import { IMember } from 'src/common/interfaces/app.interface';

@Injectable()
export class ImagesService {
  private minioClient: Minio.Client;

  constructor(
    @InjectRepository(Images)
    private imageRepo: Repository<Images>,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: parseInt(process.env.MINIO_PORT!) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    });

    void this.initializeBucket();
  }

  /**
   * Initializes the MinIO bucket. If the bucket does not exist, it creates the
   * bucket and sets its policy to public read.
   *
   * @returns {Promise<void>}
   * @private
   */
  private async initializeBucket() {
    const bucketName = process.env.MINIO_BUCKET || 'images';

    try {
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');

        // Set bucket policy to public read
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };

        await this.minioClient.setBucketPolicy(
          bucketName,
          JSON.stringify(policy),
        );
      }
    } catch (error) {
      console.error('Failed to initialize bucket:', error);
    }
  }

  /**
   * Uploads an image to MinIO and creates an image entity in the database.
   *
   * @param file The uploaded image file.
   * @param dto The image metadata.
   * @returns The created image entity.
   * @throws If the file is missing or the filename is missing.
   * @throws If the upload to MinIO fails.
   * @throws If the presigned URL or public URL cannot be generated.
   * @throws If the entity cannot be saved to the database.
   */
  private async uploadImage(
    file: Express.Multer.File,
    meta: UploadImageMetaData,
  ): Promise<Images> {
    if (!file) {
      throw new Error('Cannot upload image.');
    }
    if (!file.filename) {
      throw new Error('File name is missing.');
    }

    const bucketName = process.env.MINIO_BUCKET || 'images';

    try {
      // Create image entity
      const image = new Images();
      image.id = uuidv4();
      const ext = path.extname(file.filename);
      image.filename = `${image.id}${ext}`;
      image.description = meta.description;
      image.linkId = meta.linkId!;
      image.linkType = meta.linkType;

      // Upload file to MinIO
      const metaData = {
        'Content-Type': file.mimetype,
        'Cache-Control': 'max-age=31536000',
      };

      await this.minioClient.fPutObject(
        bucketName,
        image.filename,
        file.path,
        metaData,
      );

      // Create presigned URL or public URL
      if (process.env.MINIO_PRIVATE_ACCESS === 'true') {
        // If bucket is public access
        const protocol =
          process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        const port = process.env.MINIO_PORT ? `:${process.env.MINIO_PORT}` : '';
        image.url = `${protocol}://${process.env.MINIO_ENDPOINT}${port}/${bucketName}/${image.filename}`;
      } else {
        // Use presigned URL (expires in 7 days)
        image.url = await this.minioClient.presignedGetObject(
          bucketName,
          image.filename,
          24 * 60 * 60 * 7,
        );
      }

      // Soft delete
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.warn('Failed to delete temporary file:', error);
      }

      // Save to database
      return await this.imageRepo.save(image);
    } catch (error) {
      // Cleanup
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.warn(
          'Failed to delete temporary file after error:',
          unlinkError,
        );
      }

      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
  /**
   * Deletes an image from the MinIO storage and the database by its ID.
   *
   * @param {string} id - The ID of the image to be deleted.
   * @throws {NotFoundException} Throws if the image is not found in the database.
   * @returns {Promise<DefaultMessageResponseDto>} A promise that resolves when the image is successfully deleted.
   */
  private async delete(id: string): Promise<DefaultMessageResponseDto> {
    try {
      const image = await this.imageRepo.findOneBy({ id });

      if (!image) throw new NotFoundException('Image not found.');

      await this.minioClient.removeObject(
        process.env.MINIO_BUCKET!,
        image.filename,
      );
      await this.imageRepo.remove(image);

      return {
        message: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds an image by its ID from the database.
   *
   * @param {string} id - The ID of the image to be found.
   * @throws {NotFoundException} Throws if the image is not found in the database.
   * @returns {Promise<Images | null>} A promise that resolves to the found image or null if not found.
   */
  private async findOne(id: string): Promise<Images | null> {
    return await this.imageRepo.findOneBy({ id });
  }

  /**
   * Finds an image by its link type and link ID from the database.
   *
   * @param {LinkType} linkType - The type of the link.
   * @param {string} linkId - The ID of the link.
   * @returns {Promise<Images | null>} A promise that resolves to the found image or null if not found.
   */
  public async findByLinkTypeAndLinkId(
    linkType: LinkType,
    linkId: string,
  ): Promise<Images | null> {
    return await this.imageRepo.findOneBy({
      linkType,
      linkId,
    });
  }

  /**
   * Finds multiple images by their link type and link IDs from the database.
   *
   * @param {LinkType} linkType - The type of the link.
   * @param {string[]} linkIds - The IDs of the links.
   * @returns {Promise<Images[]>} A promise that resolves to the found images.
   */
  public async findManyByLinkTypeAndLinkIds(
    linkType: LinkType,
    linkIds: string[],
  ): Promise<Images[]> {
    return await this.imageRepo.find({
      where: {
        linkType,
        linkId: In(linkIds),
      },
    });
  }

  /**
   * Updates the avatar of a member.
   *
   * @param {Express.Multer.File} file - The uploaded file.
   * @param {IMember} member - The member to update the avatar for.
   * @returns {Promise<Images>} The updated image entity.
   * @throws {NotFoundException} If the image is not found.
   */
  async updateAvatarMember(
    file: Express.Multer.File,
    member: IMember,
  ): Promise<Images> {
    const imageMember = await this.findByLinkTypeAndLinkId(
      LinkType.MEMBER,
      member.id,
    );

    // If member has an existing image, remove the reference first
    if (imageMember) {
      // Then delete the image
      await this.minioClient.removeObject(
        process.env.MINIO_BUCKET!,
        imageMember.filename,
      );
      await this.imageRepo.remove(imageMember);
    }

    // Upload new image
    const uploadFile = await this.uploadImage(file, {
      description: `Cập nhật ảnh đại diện cho thành viên ${member.id}`,
      linkId: member.id,
      linkType: LinkType.MEMBER,
    });

    return uploadFile;
  }
}
