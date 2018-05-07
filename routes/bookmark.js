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
var Site = require('../models/site');
var Info = require('../models/Info');
var Bookmark = require('../models/bookmark');
var getToken = require('./cont/token');
var paginate = require('express-paginate');

//auth処理
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

//新規栞作成
router.post('/new', function (req,res,next) {
    var newBookmark = new Bookmark();
    newBookmark.title = req.body.title;
    newBookmark.description = req.body.description;
    newBookmark.user = req.userinfo._id;
    newBookmark.otherUser.push(req.userinfo._id);

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


// 個別栞情報GET
router.get('/:id', function (req,res) {
    Bookmark.findOne({_id: req.params.id})
        .populate({
            path: 'user otherUser trip_info',
            select: '_id name img',
            // しおり個別データ展開
            populate: {
                path:'_id',
                model:'Info'
                // // 観光地情報展開
                // populate:{
                //     path:"location",
                //     model:"Site",
                //     select:"site_name location thumbnail"
                // }
            }
        })
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

router.post('/edit/trip',function (req,res,next) {
    var newSite = new Site();
    newSite.site_name = req.body.site_name;
    newSite.location = req.body.location;

    newSite.save(function (err,success) {
        if(err) {
            res.status(400).send({success: false, validError: true,error:err});
        } else {
            req.site = success;
            next();
        }
    });

});

router.post('/edit/trip',function (req,res) {
    var newInfo = new Info();
    newInfo.location = req.site._id;
    newInfo.user = req.userinfo._id;
    newInfo.description = req.body.description;
    newInfo.save(function (err,success) {
        if(err) {
            res.status(400).send({success: false, validError: true,error:err});
        } else {
            res.json({
                success: true,
                info: success
            });

        }
    });
});

router.post('/edit/position',function (req,res,next) {
    Bookmark.findOne(
        {_id:req.body._id},
        function (err,success) {
            if(err) {
                res.status(403).json({success:false, error:err});
            }else if(success){
                req.bookmark = success;
                next();
            }
    })
});

router.post('/edit/position',function (req,res,next) {
    Bookmark.findOneAndUpdate({_id: req.bookmark._id},{
        trip_info: req.body.info
    },{ runValidators: true, context: 'query'},function (err, success) {
        if(err) {
            res.status(403).json({success:false,error:err});
        } else {
            res.json(
                {
                    success:true,
                    bookmark:success
            });
        }
    })
});


// 栞削除
router.delete('/:id',function(req,res,next) {
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

router.delete('/:id',function(req,res) {
    Bookmark.remove({
        user: req.uerinfo._id,
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