//@Author: MUNNA KUMAR SAH
//Copyright 2013,All rights reserved.


var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: { type:String ,required:true},
  email: { type:String ,required:true},
  password: { type:String ,required:true},
  mobile:{ type:String ,required:true,validate:/^$|^\d{10}$/ }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('usr',UserSchema,'registered-user');