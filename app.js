var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var productsRouter = require('./routes/productsRoute');
var usersRouter = require('./routes/usersRoute');
let clientsRouter = require('./routes/clientsRoute');
let salesRouter = require('./routes/salesRoute')
const authRoute = require('./routes/verificationToken')
var app = express();

// view engine setup


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({ origin: 'http://localhost:4000' }));
app.use('/usuarios', usersRouter);
app.use(authRoute)
app.use('/productos', productsRouter);
app.use('/clientes', clientsRouter);
app.use('/ventas',salesRouter)
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
  res.send(err.message);
});

module.exports = app;
