'use strict';

// Dependencies
const moment = require('moment');
const events = require('events');
const eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(0);

// Models
const Conversions = require('../models/conversions');

// Middlewares
const socketMiddleware = require('../middlewares/websocket').getSocket();

// Global variables
const timeoutValue = {PDF: 10000, HTML: 1000};
let queue = [];


/**
 * Runs after the item is added to the database.
 *
 * Adds the request into a queue, and emits a message that this item has been queued, along with sending the response.
 * Creates an emitter that listens to the event 'moveQueue'.
 * When triggered, checks if it this request is on the top of the queue, and if it has priority.
 * If both are true, updates the database, sends a 'processing' message through the web socket and starts the timeout.
 * Once the timeout finishes, updates the database and sends the 'processed' message through the web socket,
 * and removes the item from the queue.
 * If queue is empty, kill all listeners, otherwise trigger the event 'moveQueue' again.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the result object
 */
const convert = (req, res) => {
    const item = res.locals.bundle;
    item.priorityPassed = 0;

    // Push into queue
    queue.push(item);
    updateDatabaseAndEmit(item, 'In Queue');

    // Send the created item back
    res.send(res.locals.bundle);

    eventEmitter.on('moveQueue', () => {
        // Only let the top of the queue run, check if current item should give priority
        if (queue[0]._id !== item._id || shouldGivePriority()) {
            return;
        }
        updateDatabaseAndEmit(queue[0], 'Processing');

        setTimeout(() => {
            updateDatabaseAndEmit(queue[0], 'Processed');

            // Remove the current item (top of the queue)
            queue.shift();

            // Emit event if queue is not empty, else kill all remaining events
            if (queue.length !== 0) {
                eventEmitter.emit('moveQueue');
            } else {
                eventEmitter.removeAllListeners('moveQueue')
            }
        }, timeoutValue[item.type]);
    });

    // Start the emit chain only if there's at least one item on the queue
    if (queue.length === 1) {
        eventEmitter.emit('moveQueue');
    }
};

/**
 * Validates if the type sent is part of the types list object.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the result object
 * @param {Function} next - the callback
 */
const validateConversionData = (req, res, next) => {
    if (typeof req.body === 'undefined' || req.body === null) {
        return res.status(400).send({message: 'You missing data brotha!'});
    }
    
    if (typeof timeoutValue[req.body.type] === 'undefined') {
        return res.status(400).send({message: 'Where the type at? PDF or HTML only kthxbai!'});
    }

    next();
};

/**
 * Emits a message through the web socket.
 * If the status is 'Processing' or 'Processed', updates the database and the item's status before emitting.
 *
 * @param {Object} item - the item to emit
 * @param {String} status - the status to validate
 */
const updateDatabaseAndEmit = (item, status) => {
    if (status === 'Processing' || status === 'Processed') {
        item.status = status;
        Conversions.update({_id: item._id}, {$set: {status}}, () => {});
    }

    socketMiddleware.emit('conversion', item);
};

/**
 * Checks if the item on top of the queue should give priority to the next 'HTML' conversion or not.
 * Only 'PDF' type has to give priority, and it only gives priority to 10 'HTML' conversion requests,
 * which is validated through the property 'priorityPassed'.
 *
 * If it needs to give priority, increments said property, searches for the next 'HTML' conversion and
 * moves that item to the top of the queue.
 *
 * @return {Boolean} - true if should give priority, false otherwise
 */
const shouldGivePriority = () => {
    if (queue[0].type === 'PDF' && queue[0].priorityPassed < 10) {
        const index = queue.findIndex(item => item.type === 'HTML');

        if (index > -1) {
            queue[0].priorityPassed++;
            queue.unshift(queue.splice(index, 1)[0]);
            return true;
        }
    }

    return false;
};

// Exports functions
module.exports = {
    convert,
    validateConversionData
};
