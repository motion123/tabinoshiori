/**
 * Created by tomihei on 17/02/06.
 */
var getToken = require('./token');
var jwt = require('jwt-simple');
var User = require('../../models/user');
var config = require('../../config/database'); // get db config file


var userAuth = function(req,res,next) {
    var token = getToken(req.header);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            user_email: decoded.user_email
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed.'});
            } else {
                req.userinfo = user;
                next();
            }
        })
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
};

module.exports = userAuth;