const { getPhotosFromAPI } = require('../mutualFunctions');

module.exports = (req, res) => {
    const date = req.params.date;
    console.log('Getting photos for ' + date);
    getPhotosFromAPI(date, sendPhotos(res));
}

function sendPhotos(res) {
    return photos => {
        console.log('Sending photos');
        return res.send(photos);
    }
}