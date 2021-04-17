'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatSchema = Schema({
    text: String,
    created_at: String,
    emiter: { type: Schema.ObjectID, ref: 'User' },
    reciver: { type: Schema.ObjectID, ref: 'User' }
})

module.exports = mongoose.model('Chat', ChatSchema);