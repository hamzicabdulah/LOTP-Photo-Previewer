const express = require('express');
const path = require('path');
const routes = require('./routes');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, 'public')));
routes(app);

app.listen(port, () => {
    console.log('Listening on port ' + port);
});
