const fs = require('fs');
const archiver = require('archiver');
const randomstring = require('randomstring');
const request = require('request');
const { getPhotosFromAPI } = require('../mutualFunctions');

module.exports = (req, res) => {
    const date = req.params.date;
    console.log('Downloading photos for ' + date);
    /*const zipFilePath = 'zips/' + date + '.zip';*/
    /*if (fs.existsSync(zipFilePath)) {
        // If the requested zip file has been previously created, send it immediately, so that there is no delay
        console.log('Downloading existing zip');
        res.download(zipFilePath);
        return;
    }
    // Otherwise, there will be delay after requesting download, since the zip is yet to be created*/
    createZipAndSend(date, res);
}

function createZipAndSend(date, res) {
    /*if (!fs.existsSync("zips/")) fs.mkdirSync("zips/");
    const output = fs.createWriteStream(zipFilePath);*/
    /*output.on('close', sendToClient(zipFilePath, res));*/
    let zipFile = archiver('zip');
    //zipFile.pipe(output);
    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename=' + date + '.zip'
    });
    zipFile.pipe(res);
    getPhotosFromAPI(date, zipAndFinalize(zipFile));
}

/*function sendToClient(zipFilePath, res) {
    return () => res.download(zipFilePath);
}*/

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