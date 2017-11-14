const request = require('request');

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

module.exports = { getPhotosFromAPI };