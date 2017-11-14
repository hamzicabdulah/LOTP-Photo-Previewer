const express = require('express');
const path = require('path');
const request = require('request');
const fs = require('fs');
const archiver = require('archiver');
const async = require('async');
const randomstring = require('randomstring');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/api/photos/:date', (req, res) => {
    const dateUnmodified = req.params.date;
    console.log('Getting photos for ' + dateUnmodified);
    getPhotosFromAPI(dateUnmodified, photos => {
        console.log('Sending photos');
        res.send(photos);
        return;
    });
});

app.get('/api/download/:date', (req, res) => {
    const dateUnmodified = req.params.date;
    console.log('Downloading photos for ' + dateUnmodified);
    const zipFilePath = 'zips/' + dateUnmodified + '.zip';
    if (fs.existsSync(zipFilePath)) {
        res.download(zipFilePath);
        return;
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
});

function getPhotosFromAPI(dateUnmodified, cb) {
    const date = toValidDate(dateUnmodified);
    request(process.env.API, (err, response, body) => {
        let photos = [{}];
        if (err) {
            console.log(err);
        } else {
            photos = photosToSend(body, date);
        }
        return cb(photos);
    });
}

function toValidDate(date) {
    return date.split('-').join('/');;
}

function photosToSend(body, date) {
    const photos = JSON.parse(body).message;
    const photosToSend = photos.filter(photo => {
        return (photo.created_at.indexOf(date) >= 0);
    })
    return photosToSend;
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

app.listen(port, () => {
    console.log('Listening on port ' + port);
});
