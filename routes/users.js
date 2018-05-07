var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var config = require('../config/database'); // get db config file
var User = require('../models/user');
var passport = require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcrypt');
var getToken = require('./cont/token');

/* GET users listing. */
router.post('/new', function(req, res) {
    var user = new User();

    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;

    user.save(function(err,success) {
        if (err) {
            res.json({success:false,error: err});
        }
        if(success){
            var token = jwt.encode(success, config.secret);
            res.json({success: true, token: 'JWT ' + token});
        }
    })
});


router.post('/edit', passport.authenticate('jwt', { session: false}), function(req, res,next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded.email
        }, function (err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                req.userinfo = user;
                next();
            }
        })
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});


router.post('/edit', function(req, res,next) {
    if (req.body.password && req.body.password.length > 8) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return res.send(err)
            }
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                if (err) {
                    return res.send(err)
                }
                req.cryptpass = hash;
                next();
            });
        });
    } else {
        next();
    }
});

router.post('/edit', function(req,res){
    User.findOneAndUpdate({_id: req.userinfo._id},{
        name: req.body.name ? req.body.name : req.userinfo.name,
        email: req.userinfo.email,
        password: req.body.password ? req.cryptpass : requser.password,
        img: req.body.img ? req.body.img : req.userinfo.img ? req.userinfo.img : ""
    },{ runValidators: true, context: 'query'},function (err, success) {
        if (err) {
            res.send(err);
        } else {
            res.json({message: "update success!"});
        }
    })
});

router.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded.email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!'});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded.email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!'});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});


router.get('/:id', passport.authenticate('jwt', { session: false}), function(req, res,next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded.email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                if(user.user_id == req.params.id){
                    res.json({
                        success: true,
                        user_auth:true,
                        data: {
                            _id: user._id,
                            name: user.name,
                            img: user.img,
                        }
                    });
                }else {
                    req.userinfo = user;
                    next();
                }
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/:id', function (req,res) {
    User.findOne({
        name : req.params.name
    },function(err,user){
        if(err)
            return res.status(403).send({success: false, msg: 'User Not Found'});
        if(!user) {
            return res.status(403).send({success: false, msg: 'User Not Found'});
        }else {
            res.json({
                success: true,
                user_auth: false,
                data: {
                    _id: user._id,
                    name: user.name,
                    img: user.img,
                }
            });
        }
    })
});

/* GET home page. */
router.post('/login', function(req, res,next) {
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err)
            return res.status(403).send({success: false, msg: 'User Not Found'});
        if (!user) {
            res.send({
                success: false,
                error: {
                    errors: {
                        email: {
                            message: 'メールアドレスが間違っています'
                        }
                    }
                }
            });
        } else {
            req.userinfo = user;
            next();
        }
    });
});

router.post('/login', function(req, res) {
    req.userinfo.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.encode(req.userinfo, config.secret);
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token});
        } else {
            res.send({
                success: false,
                error: {
                    errors: {
                        password: {
                            message: 'パスワードが間違っています'
                        }
                    }
                }
            });
        }
    });
});


module.exports = router;
