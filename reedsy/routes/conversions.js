'use strict';

// Dependencies
const express = require('express');

// Models
const Conversions = require('../models/conversions');

// Business Logic
const ConversionsLogic = require('../logic/conversions');

// Endpoints
Conversions.methods(['get', 'post']);
Conversions
    .before('post', [ConversionsLogic.validateConversionData]);
Conversions
    .after('post', [ConversionsLogic.convert]);

// Routes
Conversions.route('all', ['delete'], ConversionsLogic.deleteDatabase);

// Export restful object
module.exports = Conversions;