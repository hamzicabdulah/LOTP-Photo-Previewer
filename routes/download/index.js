const fs = require('fs');
const archiver = require('archiver');
const randomstring = require('randomstring');
const { getPhotosFromAPI } = require('../mutualFunctions');

module.exports = (req, res) => {
    const dateUnmodified = req.params.date;
    console.log('Downloading photos for ' + dateUnmodified);
    const zipFilePath = 'zips/' + dateUnmodified + '.zip';
    if (fs.existsSync(zipFilePath)) {
        console.log('Downloading existing');
        res.download(zipFilePath);
        return;
    }
    if (!fs.existsSync("zips/")) {
        fs.mkdirSync("zips/");
    }
    let output = fs.createWriteStream(__dirname + '/' + zipFilePath);
    output.on('close', () => {
        res.download(zipFilePath);
        return;
    });
    let zipFile = archiver('zip');
    zipFile.pipe(output);
    getPhotosFromAPI(dateUnmodified, photos => {
        addImagesToZip(0, photos, zipFile, () => {
            zipFile.finalize();
        });
    });
}

function addImagesToZip(index, photos, zipFile, cb) {
    if (index >= photos.length) {
        console.log('Sending all photos for download');
        return cb();
    }
    const photo = photos[index];
    const photoUrl = photo.file_location;
    const photoName = photo.first_name + '_' + randomstring.generate(7) + '.jpg';
    const stream = request.get(photoUrl);
    stream.on('error', err => {
        console.log(err);
        return addImagesToZip(index, photos, zipFile, cb);
    }).on('end', () => {
        return addImagesToZip(index + 1, photos, zipFile, cb);
    });
    zipFile.append(stream, { name: photoName });
}