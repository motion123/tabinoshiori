var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


// DB connect

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/shiori', { config: { autoIndex: true } });


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bookmarkRouter = require('./routes/bookmark');
var siteRouter = require('./routes/site');

var passport = require('passport');


var app = express();


var paginate = require('express-paginate');
app.use(paginate.middleware(20, 50));


// session用のmiddlewaresを有効化
app.use(passport.initialize());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.status(200).end();
    }
    else {
        next();
    }
};
app.use(allowCrossDomain);


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/bookmark', bookmarkRouter);
app.use('/site', siteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
