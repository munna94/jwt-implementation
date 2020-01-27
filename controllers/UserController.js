//@Author: MUNNA KUMAR SAH
//Copyright 2013, All rights reserved.

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
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

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
      //delete user["_id"];
      //delete user["__v"];

      // else create a token
      let token = generateTokenAfterSignUp(user);
      //generateToken(user);
      res
        .status(200)
        .send({
          message: "user registered successsfully",
          //data: user,
          token: token
        });
    }
  );
};

let login = (req, res) => {
  var redis = require("redis"),
    client = redis.createClient(redis_port, redis_host);

  let id = req.params.id;
  //store id when it get login so that we can check if user login when verifying
  client.on("error", function(err) {
    client.quit();
    return res.status(500).send({ message: "failed to connect server", err });
  });

  client.set(id, redis.print, "EX", 600, (err, result) => {
    client.quit();
    //if (err)
    //return res.status(500).send({ message: "failed to connect server",err });
    res.status(200).send({ message: "user login successfully" });
  });
};

let logout = (req, res) => {
  console.log("inside logout===");
  
  let id = req.params.id;
  var redis = require("redis"),
    client = redis.createClient(redis_port, redis_host);
  //remove from redis
  client.del(id, (err, result) => {
    console.log("loged out");
    
    if (err)
      return res.status(500).send({ message: "failed to connect server" });
    res.status(200).send({ message: "user logout successfully" });
  });
};

let generateTokenAfterSignUp = (user) => {
  let token = jwt.sign({ id: user._id }, secret, {
    expiresIn: 600 // total number of second // 10 minute
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
