import { Request, Response } from 'express';
import { response } from '@core/presentation/utils/response.js';
import { storageMessages } from '../../domain/constants/storage.messages.js';
import { S3StorageServiceImpl } from '../../infrastructure/services/s3-storage.service.impl.js';
import { GeneratePresignedUrlUseCase } from '../../application/use-cases/generate-presigned-url.use-case.js';

export class StorageController {
  private readonly storageService = new S3StorageServiceImpl();
  private readonly generatePresignedUrlUseCase = new GeneratePresignedUrlUseCase(
    this.storageService,
  );

  generatePresignedUrl = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this.generatePresignedUrlUseCase.execute(req.body, userId);

    response(
      res,
      storageMessages.presignedUrlSuccess.statusCode,
      storageMessages.presignedUrlSuccess.message,
      result,
    );
  };
}

