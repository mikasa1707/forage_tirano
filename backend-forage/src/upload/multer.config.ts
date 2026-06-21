import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

export const mediaFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',

    // Vidéos
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime', // mov
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(`Type de fichier non autorisé : ${file.mimetype}`),
      false,
    );
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

  fileFilter: mediaFileFilter,

  limits: {
    fileSize: 300 * 1024 * 1024, // 300 MB
  },
});

// Export des configs séparées
export const travauxMulterConfig = createMulterConfig('./uploads/travaux');
export const equipesMulterConfig = createMulterConfig('./uploads/equipes');
export const servicesMulterConfig = createMulterConfig('./uploads/services');
