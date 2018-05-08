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
            email: decoded.email
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
router.get('/:id', function (req,res,next) {
    Bookmark.findOne({_id: req.params.id})
        .populate({
            path: 'user otherUser',
            select: '_id name img'
        })
        .exec(function (err, success){

            var options = {
                path:'trip_info',
                model:'Info',
                select:'_id user description location'
            };

            if(err){
                res.status(404).send({success:false, msg: err})
            }　else if(!success) {
                return res.status(404).send({success: false, msg: 'Bookmark not found'});
            } else {
                Bookmark.populate(success,options, function (err, bookmark) {
                    if(!err) {
                        req.bookmark = bookmark;
                        next();
                    }else{
                        res.json({
                            success:true,
                            bookmark:success
                        })
                    }
                });
            }
        })
});

router.get('/:id', function (req,res) {

    var options = {
        path:'trip_info.location',
        model:'Site',
        select:'_id site_name location favorite'
    };

    Bookmark.populate(req.bookmark,options,function (err,success) {
       if(err) {
                res.status(400).send({success: false, error:err});
       } else {
           res.json({
                success:true,
                bookmark:success
            })
        }
    })
});

router.post('/edit/trip',function (req,res,next) {
   Bookmark.findOne({
       _id:req.body._id
   },function (err,success) {
       if(err){
           res.status(400).send({success: false,error:err});
       }else{
           var result = success.otherUser.some(function (val) {
               var t;
               val != null ?  t=val :  t=1;
               return t.toString() === req.userinfo._id.toString();
           });
           if(result){
               next();
           }else{
               res.status(403).send({success:false,message:"権限がありません。"})
           }
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

router.post('/edit/trip',function (req,res,next) {
    var newInfo = new Info();
    newInfo.location = req.site._id;
    newInfo.user = req.userinfo._id;
    newInfo.description = req.body.description;
    newInfo.save(function (err,success) {
        if(err) {
            res.status(400).send({success: false, validError: true,error:err});
        } else {
            req.info = success;
            next();
        }
    });
});


router.post('/edit/trip',function (req,res,next) {
    Bookmark.update({_id: req.body._id},{
        $push:{trip_info:req.info._id }
    },function (err, success) {
        if (!success) {
            res.status(403).json({success: false, error: err});
        } else {
            res.json(
                {
                    success: true,
                    info: req.info,
                    bookmarks: success
                });
        }
    })
});

router.post('/edit/trip/order',function (req,res,next) {
    Bookmark.findOne({
        _id:req.body._id
    },function (err,success) {
        if(err){
            res.status(400).send({success: false,error:err});
        }else{
            var result = success.otherUser.some(function (val) {
                var t;
                val != null ?  t=val :  t=1;
                return t.toString() === req.userinfo._id.toString();
            });
            if(result){
                next();
            }else{
                res.status(403).send({success:false,message:"権限がありません。"})
            }
        }
    })
});

router.post('/edit/trip/order',function (req,res,next) {
    Bookmark.update({_id: req.body._id},{
        $set:{trip_info:req.body.trip_info_list }
    },function (err, success) {
        if (!success) {
            res.status(403).json({success: false, error: err});
        } else {
            res.json(
                {
                    success: true
                });
        }
    })
});


router.post('/permission',function (req,res,next) {
    User.find({
        name:req.body.name
    },function (err,success) {
        if(err){
            res.status(403).json({success:false,message:"ユーザーがいません",error:err});
        }else{
            req.user = success[0]._id;
            next();
        }
    })
});

router.post('/permission',function (req,res,next) {
    Bookmark.findOne({
        _id:req.body._id
    },function (err,success) {
        if(err){
            res.status(403).json({success:false,message:"ブックマークがありません",error:err});
        }else{
            if(req.userinfo._id.toString() === success.user.toString()){
                next();
            } else{
                res.status(401).json({success:false,message:"権限がありませんｎ",error:err});
            }
        }
    })
});

router.post('/permission',function (req,res,next) {
    Bookmark.update({
        _id:req.body._id
    },{ $push:{otherUser: req.user}},function (err,success) {
        if(err){
            res.status(403).json({success:false,message:"権限付与に失敗しました。",error:err});
        }else{
            res.json({
                success:true,
                other_user: req.user
            })
        }
    })
});

router.post('/permission/del',function (req,res,next) {
    Bookmark.findOne({
        _id:req.body._id
    },function (err,success) {
        if(err){
            res.status(403).json({success:false,message:"ブックマークがありません",error:err});
        }else{
            if(req.userinfo._id.str === success.user.str){
                next();
            } else{
                res.status(401).json({success:false,message:"権限がありませんｎ",error:err});
            }
        }
    })
});

router.post('/permission/del',function (req,res) {
   Bookmark.update({
       _id:req.body._id
   },{$pull:{otherUser: req.body.other_user_id}},
   function (err,success) {
       if(err){
           res.status(403).json({success:false,message:"削除に失敗しました。",error:err});
       } else{
           res.json({
               success:true
           })
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