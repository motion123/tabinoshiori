/**
 * Created by tomino on 18/05/08.
 */
var config = require('../../config/database'); // get db config file
var User = require('../../models/user');
var passport = require('passport');
require('../../config/passport')(passport);
var Site = require('../../models/site');
var Info = require('../../models/Info');
var Bookmark = require('../../models/bookmark');

/* GET users listing. */

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/shiori');

User.remove({},function(err){
    if(err) console.log(err);
});

Site.remove({},function(err){
    console.log(err);
});

Info.remove({},function(err){
    console.log(err);
});

Bookmark.remove({},function(err){
    console.log(err);
});
