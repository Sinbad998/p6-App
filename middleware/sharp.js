const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Middleware pour optimiser les images avec sharp
const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next(); 
    }

    try {
        const inputPath = req.file.path;
        const outputPath = inputPath + '.webp'; // Sortie en format WebP

        console.log('Optimizing image...');
        await sharp(inputPath)
            .resize(300, 300) 
            .webp({ quality: 80 }) 
            .toFile(outputPath); 

        // Supprimer l'image originale pour ne garder que l'image optimisée
        fs.unlink(inputPath, (err) => {
            if (err) {
                console.log('Error deleting original file:', err);
            } else {
                console.log('Original file deleted');
            }
        });

        // Ajouter le chemin du fichier optimisé à `req.file`
        req.file.optimizedPath = outputPath;
        next();

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Image processing failed.' });
    }
};

// Exporter le middleware
module.exports = optimizeImage;
