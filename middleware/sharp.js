const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res, next) => {
    if (!req.file) {
        console.log('No file found in request');
        return next();
    }

    try {
        const inputPath = req.file.path;
        const outputPath = inputPath + '.webp'; 

        console.log('Optimizing image...');
        await sharp(inputPath)
            .resize(300, 300) 
            .webp({ quality: 80 }) 
            .toFile(outputPath); 

        console.log('Image optimized, deleting original file...');
        try {
            await fs.unlink(inputPath);
            console.log('Original file deleted');
        } catch (err) {
            console.log('Error deleting original file:', err);
        }

        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath);

        next();
    } catch (error) {
        console.log('Error processing image:', error);
        next(error);
    }
};