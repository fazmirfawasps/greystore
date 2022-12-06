var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var categoryRouter=require('./routes/category')
var dashRouter=require('./routes/dashboard')

var db=require("./config/connections")
var hbs=require('hbs');
const console = require('console');
var app = express();

var pathpartial=path.join(__dirname,'views/partials')
hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(pathpartial)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",cookie:{maxAge:6000*60}}))

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

db.connect(((err)=>{
  if (err)
  console.log('connection error')
  else
  console.log("success")
}))

app.use('/', adminRouter);
app.use('/users', usersRouter);
app.use('/category',categoryRouter)
app.use('/dashboard',dashRouter)
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
