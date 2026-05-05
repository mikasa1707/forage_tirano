import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return cb(null, false);
  }
  cb(null, true);
};

const createMulterConfig = (destination: string) => ({
  storage: diskStorage({
    destination,
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 300 * 1024 * 1024, // 5MB max
  },
});

// Export des configs séparées
export const travauxMulterConfig = createMulterConfig('./uploads/travaux');
export const equipesMulterConfig = createMulterConfig('./uploads/equipes');
export const servicesMulterConfig = createMulterConfig('./uploads/services');
