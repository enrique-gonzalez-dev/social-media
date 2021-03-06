'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
    user: { type: Schema.ObjectID, ref: 'User' },
    followed: { type: Schema.ObjectID, ref: 'User' }
});

module.exports = mongoose.model('Follow', FollowSchema);