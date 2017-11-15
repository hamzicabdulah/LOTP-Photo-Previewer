const fs = require('fs');
const archiver = require('archiver');
const randomstring = require('randomstring');
const request = require('request');
const { getPhotosFromAPI } = require('../mutualFunctions');

module.exports = (req, res) => {
    const date = req.params.date;
    console.log('Downloading photos for ' + date);
    createZipAndSend(date, res);
}

function createZipAndSend(date, res) {
    let zipFile = archiver('zip');
    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename=' + date + '.zip'
    });
    zipFile.pipe(res);
    getPhotosFromAPI(date, zipAndFinalize(zipFile));
}

function zipAndFinalize(zipFile) {
    return photos => {
        addImagesToZip(0, photos, zipFile, () => {
            console.log('Finishing up with download');
            zipFile.finalize();
        });
    }
}

function addImagesToZip(index, photos, zipFile, cb) {
    if (index >= photos.length) {
        return cb();
    }
    const photo = photos[index];
    const photoUrl = photo.file_location;
    const photoName = photo.first_name + '_' + randomstring.generate(7) + '.jpg';
    const stream = request.get(photoUrl);
    stream.on('error', retryImage(index, photos, zipFile, cb))
        .on('end', moveToNextImage(index, photos, zipFile, cb));
    zipFile.append(stream, { name: photoName });
}

function retryImage(index, photos, zipFile, cb) {
    return err => {
        console.log(err);
        return addImagesToZip(index, photos, zipFile, cb);
    }
}

function moveToNextImage(index, photos, zipFile, cb) {
    return () => {
        return addImagesToZip(index + 1, photos, zipFile, cb);
    }
}