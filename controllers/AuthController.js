//@Author: MUNNA KUMAR SAH
//Copyright 2013,All rights reserved.


var User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = process.env.SECRET_KEY;
const redis_host = process.env.REDIS_HOST;
const redis_port = process.env.REDIS_PORT;


let generateToken = (req, res) => {
  let password = req.body.password;
  let mobile = req.body.mobile;

  //let referenceId = req.query.referenceId;
  if (!password || !mobile)
    return res.status(400).send({ message: "invalid details.. missing body " });
  User.findOne({ mobile: mobile }, (err, user) => {
    if (err)
      return res
        .status(400)
        .send({ message: "error while getting user details " });
    else if (!user)
      return res.status(401).send({
        message: "invalid mobile.Please register user first",
        auth: "failed"
      });
    else if (user) {
      let passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid)
        return res
          .status(401)
          .send({ auth: false, message: "invalid password." });
    }

    let token = jwt.sign({ id: user._id }, secret, {
      expiresIn: 600 // total number of second //2 minute
    });
    res.status(200).send({ auth: true, token: token });
  });
};

let verifyToken = (req, res) => {
  console.log("inside verify token==>");
  
  var redis = require("redis"),
  client = redis.createClient(redis_port,redis_host);
  let token = req.headers["jwt-token"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, secret, function(err, decoded) {
    if (err) {
      //when token expire then we need to remove logged in details from redis
      res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    } else {
      let id = decoded.id;
      //check from redis user logged in or not if not return
      client.get(id, function(err, loggedInId) {
        client.quit();
        // reply is null when the key is missing
        if (!loggedInId)
          return res.status(401).send({
            auth: false,
            message: "user has been already logged out."
          });
        res.status(200).send({ auth: true, payload: decoded });
      });
    }
  });
};

module.exports = {
  verifyToken,
  generateToken
};
