/**
 * Created by tomino on 18/05/07.
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

//新規ロケーション作成
router.post('/new', function (req,res,next) {
    var newSite = new Site();
    newSite.site_name = req.body.site_name;
    newSite.location = req.body.location;

    newSite.save(function (err,success) {
        if(err) {
            res.status(400).send({success: false, validError: true,error:err});
        } else {
            res.json({
                success: true,
                site: success
            });

        }
    });
});

// 個別Location情報GET
router.get('/:id', function (req,res) {
    Site.findOne({_id: req.params.id},function (err, success){
            if(err){
                res.status(404).send({success:false, msg: err})
            }　else if(!success) {
                return res.status(404).send({success: false, msg: 'site not found'});
            } else {
                res.json({
                    success: true,
                    data:success
                });
            }
        })
});

module.exports = router;