'use strict';

// Dependencies
const express = require('express');

// Init
let router = express.Router();

// Routes
const Conversions = require('./conversions');

// Registrations
Conversions.register(router, '/conversions');

// Export router
module.exports = router;