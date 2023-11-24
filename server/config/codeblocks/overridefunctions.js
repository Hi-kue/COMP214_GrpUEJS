const express = require('express');

// -- override express's REDIRECT functrion
let originalRedirect = express.response.redirect;
express.response.redirect = function(url) {
    // ...
    console.log('redirecting to:',url);
    originalRedirect.call(this, url);
};

// -- override express's RENDER functrion
let originalRender = express.response.render;
express.response.render = function(view, locals, callback) {
    // ...
    console.log('rendering:',view);
    // console.log('user check skipped - for debuging. /server/config/codeblock/overridefunction.js');
    // make sure there is a user, or the page is login or rigister page.
    if (this.req.user || view === 'login' || view === 'register'){
        originalRender.call(this, view, locals, callback);
    } else {
        originalRender.call(this, 'login', locals, callback);
    }
    // call the original render function
    originalRender.call(this, view, locals, callback);
};