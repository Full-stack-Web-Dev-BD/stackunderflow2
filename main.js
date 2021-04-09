var express = require('express');
var bodyparser = require('body-parser');
var app = express();
var session = require("express-session")
var dotenv = require("dotenv");
const morgan = require('morgan')

dotenv.config();
var mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE)

var port = process.env.PORT;
var indexRouter = require("./routes/index");
var homeRouter = require("./routes/home");
app.use(morgan("dev"))
app.use(bodyparser());
app.use(session({ 'secret': 'my secret key' }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use('/uploads', express.static('./uploads'))
app.use((req, res, next) => {
    res.locals = {
        "APPNAME": process.env.APPNAME,
        "VERSION": process.env.VERSION,
        "user": {}
    }
    if (req.session.user)
        res.locals.user = req.session.user
    next()
})

app.use('/', indexRouter);
app.use('/home', homeRouter);

app.listen(port, () => { console.log('Server started : ' + port) });