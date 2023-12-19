const express = require('express');
const logger = require('../utils/logger.js');


const originalSend = express.response.send;
let originalRedirect = express.response.redirect;

express.response.redirect = () => {
    logger.info(`Redirecting to: ${url}`);
    originalRedirect.call(this, url);
}


let originalRender = express.response.render;

express.response.render = function(view, locals, callback) {
    logger.info(`Rendering: ${view}`)

    const views = {
        login: 'login',
        register: 'register',
    }

    if (this.req.user || view === views.login || view === views.register){
        originalRender.call(this, view, locals, originalRender.call(this, 'login', locals, callback));
    }
};