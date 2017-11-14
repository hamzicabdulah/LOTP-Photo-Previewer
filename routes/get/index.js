const { getPhotosFromAPI } = require('../mutualFunctions');

module.exports = (req, res) => {
    const dateUnmodified = req.params.date;
    console.log('Getting photos for ' + dateUnmodified);
    getPhotosFromAPI(dateUnmodified, photos => {
        console.log('Sending photos');
        res.send(photos);
        return;
    });
}