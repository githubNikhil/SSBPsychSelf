import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { log } from './vite';
import extract from 'extract-zip';
import { fileTypeFromBuffer } from 'file-type';

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PPT_DIR = path.join(UPLOAD_DIR, 'ppt');
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images');

// Initialize directories
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
  log('Created uploads directory');
}

if (!fs.existsSync(PPT_DIR)) {
  fs.mkdirSync(PPT_DIR);
  log('Created PPT directory');
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR);
  log('Created images directory');
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PPT_DIR);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp and original extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Configure file filter to accept only PPT files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PowerPoint files (PPT or PPTX) are allowed'));
  }
};

// Configure upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Helper function to extract images from a PPTX file
export async function extractImagesFromPPTX(filePath: string): Promise<string[]> {
  try {
    // Create a temporary directory for extraction
    const tempDir = path.join(UPLOAD_DIR, 'temp', path.basename(filePath, path.extname(filePath)));
    
    if (!fs.existsSync(path.join(UPLOAD_DIR, 'temp'))) {
      fs.mkdirSync(path.join(UPLOAD_DIR, 'temp'));
    }
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Extract the PPTX file (which is actually a ZIP)
    await extract(filePath, { dir: tempDir });
    
    // Look for media directory which contains the images
    const mediaDir = path.join(tempDir, 'ppt', 'media');
    const imageUrls: string[] = [];
    
    if (fs.existsSync(mediaDir)) {
      const files = fs.readdirSync(mediaDir);
      
      // Move and rename image files to our images directory
      for (const file of files) {
        const filePath = path.join(mediaDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        // Determine if it's an image file
        const fileType = await fileTypeFromBuffer(fileBuffer);
        
        if (fileType?.mime.startsWith('image/')) {
          const newFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileType.ext}`;
          const newFilePath = path.join(IMAGES_DIR, newFileName);
          
          fs.writeFileSync(newFilePath, fileBuffer);
          
          // Generate a URL that can be accessed from the client
          const imageUrl = `/uploads/images/${newFileName}`;
          imageUrls.push(imageUrl);
        }
      }
    }
    
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    return imageUrls;
  } catch (error) {
    console.error('Error extracting images from PPTX:', error);
    throw error;
  }
}

// Helper function to get all TAT image sets
export function getAllTATImageSets(): { [key: string]: string[] } {
  const tatImageSets: { [key: string]: string[] } = {};
  
  // List all PPT files
  const pptFiles = fs.readdirSync(PPT_DIR).filter(file => 
    file.endsWith('.ppt') || file.endsWith('.pptx')
  );
  
  // Get all images from the images directory
  const allImages = fs.readdirSync(IMAGES_DIR);
  
  // Create a mapping of PPT filenames to image sets
  // For simplicity, we'll use the PPT file creation time as the key to match images
  pptFiles.forEach(pptFile => {
    const pptFilePath = path.join(PPT_DIR, pptFile);
    const pptStats = fs.statSync(pptFilePath);
    const pptCreationTime = Math.floor(pptStats.birthtimeMs / 1000) * 1000; // Round to nearest second
    
    // Find all images that match this PPT file's creation time
    // (This is a simplification - in reality we'd need a more robust way to match images to their source PPT)
    const matchingImages = allImages.filter(img => {
      const imgCreationTime = parseInt(img.split('-')[0], 10);
      return Math.abs(imgCreationTime - pptCreationTime) < 1000 * 60 * 5; // Within 5 minutes
    });
    
    if (matchingImages.length > 0) {
      tatImageSets[pptFile] = matchingImages.map(img => `/uploads/images/${img}`);
    }
  });
  
  return tatImageSets;
}

// Helper function to get a random TAT image set
export function getRandomTATImageSet(): string[] {
  const imageSets = getAllTATImageSets();
  const setKeys = Object.keys(imageSets);
  
  if (setKeys.length === 0) {
    // Return an empty array if no image sets are available
    return [];
  }
  
  // Select a random image set
  const randomIndex = Math.floor(Math.random() * setKeys.length);
  return imageSets[setKeys[randomIndex]];
}

// Middleware to handle file upload errors
export function handleUploadErrors(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
}