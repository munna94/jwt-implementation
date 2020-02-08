//@Author: MUNNA KUMAR SAH
//Copyright 2020,All rights reserved.


var mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
mongoose.Promise = global.Promise;
const uri = process.env.DB_HOST;

mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}, function (err) {
  if (err) {
    console.log("error while connectinh to db");
    console.log(err);
  }
});
module.exports = {
  mongoose //this will return the mongoose object
};