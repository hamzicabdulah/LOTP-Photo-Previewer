const get = require('./get');
const download = require('./download');

module.exports = (app) => {
    app.get('/api/photos/:date', get);
    app.get('/api/download/:date', download);
}