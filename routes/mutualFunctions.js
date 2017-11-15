const request = require('request');

function getPhotosFromAPI(dateUnmodified, cb) {
    const date = toValidDate(dateUnmodified);
    request(process.env.API, returnPhotos(date, cb));
}

function toValidDate(date) {
    return date.split('-').join('/');
}

function returnPhotos(date, cb) {
    return (err, response, body) => {
        let photos = [{}];
        if (err) console.log(err);
        else photos = photosToSend(body, date);
        return cb(photos);
    }
}

function photosToSend(body, date) {
    const photos = JSON.parse(body).message;
    return photos.filter(createdOn(date));
}

function createdOn(date) {
    return photo => (photo.created_at.indexOf(date) >= 0);
}

module.exports = { getPhotosFromAPI };