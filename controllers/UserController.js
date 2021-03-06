//@Author: MUNNA KUMAR SAH
//Copyright 2020, All rights reserved.

var express = require("express");
var User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY;

const redis_host = process.env.REDIS_HOST;
const redis_port = process.env.REDIS_PORT;

let getStatus = function(req, res) {
  res.status(200).send({ status: "success" });
};

let register = (req, res) => {
  if (!req.body.password || !req.body.mobile || !req.body.name)
    return res.status(400).send({ message: "missing body fields.." });
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  //FIRST CHECK IF THIS MOBILE IS REGISTERED
  User.findOne({ mobile: req.body.mobile }, (err, existingUser) => {
    if (err)
      return res
        .status(400)
        .send({ message: "error while getting user details " });
    if (existingUser)
      return res
        .status(409)
        .send({ message: "user already registered with this mobile.." });

    User.create(
      {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        mobile: req.body.mobile
      },
      function(err, user) {
        if (err)
          return res
            .status(500)
            .send("There was a problem registering the user.");
        // else create a token
        let token = generateTokenAfterSignUp(user);
        //generateToken(user);
        res.status(200).send({
          message: "user registered successsfully",
          //data: user,
          token: token
        });
      }
    );
  });
};

let login = (req, res) => {
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
  

  var redis = require("redis"),
    client = redis.createClient(redis_port, redis_host);

  //let id = req.params.id;
  //store id when it get login so that we can check if user login when verifying
  client.on("error", function(err) {
    client.quit();
    return res.status(500).send({ message: "failed to connect server", err });
  });
    let id = user["_id"].toString();
  client.set(
    id,
    JSON.stringify(user),
    "EX",
    parseInt(process.env.TOKEN_EXPIRY),
    (err, result) => {
      //redis key should not be more than token expiry here it is max 15 minute
      client.quit();
      if (err)
        return res
          .status(500)
          .send({ message: "failed to connect server", err });

      res.status(200).send({ message: "user login successfully" });
    }
  );
});
};

let logout = (req, res) => {
  let mobile=req.body.mobile
  console.log("inside logout===");

  if (!mobile)
    return res.status(400).send({ message: "invalid mobile.. missing paramemeter mobile " });
  
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
 

  let id = user['id'];
  var redis = require("redis"),
    client = redis.createClient(redis_port, redis_host);
  //remove from redis
  client.del(id, (err, result) => {
    console.log("loged out");

    if (err)
      return res.status(500).send({ message: "failed to connect server" });
    res.status(200).send({ message: "user logout successfully" });
  });
});
};

let generateTokenAfterSignUp = user => {
  console.log("generated token with ex time==]",process.env.TOKEN_EXPIRY);
  let token = jwt.sign({ id: user._id }, secret, {
    expiresIn: parseInt(process.env.TOKEN_EXPIRY) // total number of second // 10 minute
  });
  return token;
  //res.status(200).send({ auth: true, token: token });
};

// // UPDATES A SINGLE USER IN THE DATABASE
// router.put('/:id', function (req, res) {
//     User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
//         if (err) return res.status(500).send("There was a problem updating the user.");
//         res.status(200).send(user);
//     });
// });

module.exports = {
  getStatus,
  register,
  login,
  logout
};
