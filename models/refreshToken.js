//@Author: MUNNA KUMAR SAH
//Copyright 2020,All rights reserved.


var mongoose = require('mongoose');  
var RefreshTokenSchema = new mongoose.Schema({  
  token: { type:String ,required:true},
  createdOn: { type:Number},
  expiredOn: {type:Number},
});
mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = mongoose.model('token',RefreshTokenSchema,'refreshTokens');