//@Author: MUNNA KUMAR SAH
//Copyright 2013,All rights reserved.

var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
let masterRouter = require("./routes/masterRouter"); 

var db = require('./db');
let cors = require("cors"); 
app.use(cors()); 

app.use(express.urlencoded({
    extended: false,
    limit: "500mb"
}));
app.use(express.json({
    limit: "50mb"
}));

//middleware to accept CORs
app.use(function (req, res, next) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

var server = app.listen(port, function() {
    console.log('Express server listening on port ' + port);
  });
  

module.exports = app;
app.use("/", masterRouter); 