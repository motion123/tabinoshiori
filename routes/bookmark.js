/**
 * Created by tomino on 18/05/06.
 */

var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var Site = require('../models/site_info');
var Bookmark = require('../models/bookmark');
var getToken = require('./cont/token');
var paginate = require('express-paginate');
var urlParser = require('../url/urlparse');
var thumbnailCreator = require('../thumbnail/selector');


router.use(passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if(token){
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            user_email: decoded.user_email
        },function (err, user) {
            if(err) throw err;
            if(!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed.'});
            } else {
                req.userinfo = user;
                next();
            }
        })
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/new', function (req,res,next) {
    var newBookmark = new Bookmark();
    newBookmark.title = req.body.title;
    newBookmark.description = req.body.description;
    newBookmark.user = req.userinfo._id;

    newBookmark.save(function (err,success) {
        if(err) {
            res.status(400).send({success: false, validError: true,error:err});
        } else {
            res.json({
                success: true,
                bookmark: success
            });

        }
    });
});

router.get('/:id', function (req,res) {
    Bookmark.findOne({_id: req.params.id})
        .populate({path: 'user', select: '_id name img'})
        .exec(function (err, success){
            if(err){
                res.status(404).send({success:false, msg: err})
            }　else if(!success) {
                return res.status(404).send({success: false, msg: 'Bookmark not found'});
            } else {
                res.json({
                    success: true,
                    data:success
                });
            }
        })
});


router.delete('/:id/delete',function(req,res,next) {
    Bookmark.findOne({
        user: req.userinfo._id,
        _id: req.params.id
    }, function (err, success) {
        if (err) {
            res.status(403).json({success: false, error: err});
        }else if(success) {
            req.bookmarkinfo = success;
            next();
        } else {
            res.status(403).json({success: false, message: "Not Found"});
        }
    });

});

router.delete('/:id/delete',function(req,res) {
    Bookmark.remove({
        user: req.userinfo._id,
        _id: req.params.id
    },function (err, success) {
        if (err)
            res.status(403).json({success:false,error:err});
        else if(success)
        res.json({
            success:true,
            message: "bookmark deleted",
            bookmark: {
                title: req.bookmarkinfo.title
            }
        });

    })
});

module.exports = router;