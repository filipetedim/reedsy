'use strict';

// Dependencies
const restful = require('node-restful');
const mongoose = restful.mongoose;

// Schema
const ConversionsSchema = mongoose.Schema({
    name: String,
    created_at: Date,
    type: String,
    status: String,
    priorityPassed: Number
});

/**
 * Counts the number of conversions by type.
 *
 * @memberOf Conversions
 *
 * @param {String} type - the conversion type
 * @param {Function} next - the callback
 */
ConversionsSchema.statics.countByType = function (type, next) {
    this.count({type}, (err, count) => {
        next(err, count);
    });
};

/** @class Conversions */
const Conversions = restful.model('Conversions', ConversionsSchema);

// Return model
module.exports = Conversions;