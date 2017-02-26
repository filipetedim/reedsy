'use strict';

// Dependencies
const config = require('./config');
const socketMiddleware = require('./middlewares/websocket');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');

// Init
const app = express();
const server = http.Server(app);
mongoose.Promise = global.Promise;
mongoose.connect(config.getDbConnectionUrl());

// Web socket init
socketMiddleware.initialize(server);

// Middlewares
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Routes
app.use('/api', require('./routes'));

// Run
server.listen(config.PORT, () => {
    console.log(`Server started on port ${config.PORT}`);
});