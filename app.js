const routes = require('./server/routes/index.js');
const logger = require('./server/config/utils/logger.js')
const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('port',  3000);
app.use(express.static('./public'));
app.use(express.static('./node_modules'));

app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.listen(app.get('port'), () => {
    logger.info(`Server running at http://localhost:${app.get('port')}`, 'app.jss');
});

module.exports = app;
