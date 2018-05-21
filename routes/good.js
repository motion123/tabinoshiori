/**
 * Created by tomino on 18/05/17.
 */
var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var Bookmark = require('../models/bookmark');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var getToken = require('./cont/token');
var paginate = require('express-paginate');
var Good = require('../models/good');

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



router.post('/new', function(req, res,next) {
    Bookmark.findOne({
        _id: req.body.bookmark_id
    },function (err, user) {
        if(err) {
            return res.status(403).send({success: false, error: err})
        } else if(!user) {
            return res.status(404).send({success:false, msg: 'しおりがありません,'})
        } else{
            next();
        }
    })

});


router.post('/new', function(req, res) {
    var good = new Good();
    good.bookmark = req.body.bookmark_id;
    good.user = req.userinfo._id;

    good.save(function(err,success) {
        if (err) {
            res.status(403).send({success:false,error: err});
        } else if(success){
            res.json({success: true, data:success});
        }
    })
});


router.get('/:id', function(req,res) {
    Good.find({bookmark: req.params.id})
        .distinct("user", (err,ids)=>{
            User.paginate({'_id':{$in : ids}},{
                select:'_id name thumbnail',
                page: req.query.page,
                limit: req.query.limit
            },function (err,success) {
                if(err){
                    return res.status(404).send({success:false, msg: 'いいね取得失敗'});
                } else if(!success) {
                    return res.status(404).send({success: false, msg: 'いいね取得失敗'});
                }else {
                    res.json({
                        success: true,
                        currentPage: success.page,
                        pageCount: success.pages,
                        itemCount: success.total,
                        followdata: success.docs
                    });
                }
            })
        })
});

router.delete('/:id',function (req,res) {
    Good.remove({
        user: req.userinfo._id,
        bookmark: req.params.id
    },function(err,success){
        if(err){
            res.json({success:false,error: err});
        } else if (success){
            res.json({success: true,data:success})
        }
    })
});


module.exports = router;