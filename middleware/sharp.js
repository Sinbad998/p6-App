const sharp = require('sharp');
const fs = require('fs')
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
             sharp(inputPath)
            .resize(300, 300) 
            .webp({ quality: 80 }) 
            .toFile(outputPath); 

        console.log('Image optimized, deleting original file...');
        try {
            fs.unlinkSync(inputPath);
            console.log('Original file deleted');
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('File not found, skipping deletion.');
            } else {
                console.log('Error deleting original file:', err);
                return res.status(500).json({ message: 'Error deleting original file', error: err });
            }
        }

        // Mise à jour des informations de fichier dans la requête
        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath);

        console.log('Image processing complete.');
        return res.status(200).json({
            message: 'Image processed successfully',
            file: {
                path: req.file.path,
                filename: req.file.filename,
            },
        }); // Réponse de succès avec les informations du fichier optimisé
    } catch (error) {
        console.log('Error processing image:', error);
        return res.status(500).json({ message: 'Error processing image', error }); // Réponse en cas d'erreur
    }
};