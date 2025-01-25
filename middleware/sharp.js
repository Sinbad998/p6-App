const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Middleware pour optimiser les images avec sharp
const newOpImages = async (req, res, next) => {
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
        fs.unlink(inputPath, (err) => {
            if (err) {
                console.log('Error deleting original file:', err);
            } else {
                console.log('Original file deleted');
            }
        });

        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath);

        next();
    } catch (error) {
        console.log('Error optimizing image:', error);
        next(error);
    }
};

module.exports = newOpImages;