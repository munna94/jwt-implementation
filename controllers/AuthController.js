//@Author: MUNNA KUMAR SAH
//Copyright 2013,All rights reserved.

var User = require("../models/user");
var RefreshToken = require("../models/refreshToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randtoken = require("rand-token");
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
    client = redis.createClient(redis_port, redis_host);
  let token = req.headers["jwt-token"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, secret, function(err, decoded) {
    if (err) {
      //when token expire then we need to remove logged in details from redis
      res
        .status(500)
        .send({ auth: false, message: "invalid or expired token.Please regenerate " });
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

let refreshToken = (req, res) => {
  RefreshToken.findOne({}, (err, result) => {
    let currentTime = new Date().getTime();
    if (err)
      return res.status(500).send({ message: "failed to fetch token .." });
    if (!result) {
      createRefreshToken(req, res);
    } else if (currentTime - result["expiredOn"] > 0) {
      //elapsed expired time
      //generate new token
      updateRefreshToken(req, res, result["_id"]);
    } else {
      console.log("inside normal==>");

      //return existing token
      res.status(200).send({ token: result["token"] });
    }
  });
};

let createRefreshToken = (req, res) => {
  let expiredOn = new Date().getTime() + 5 * 60 * 1000; //15 min inti millisec
  let refreshToken = randtoken.uid(256);
  RefreshToken.create(
    {
      token: refreshToken,
      createdOn: new Date().getTime(),
      expiredOn: expiredOn
    },
    (err, result) => {
      if (err)
        return res
          .status(500)
          .send({ message: "failed to save newly created token .." });
      res.status(200).send({ token: result["token"] });
    }
  );
};

let updateRefreshToken = (req, res, id) => {
  let expiredOn = new Date().getTime() + 5 * 60 * 1000; //15 min inti millisec
  let refreshToken = randtoken.uid(256);
  RefreshToken.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        createdOn: new Date().getTime(),
        expiredOn: expiredOn,
        token: refreshToken
      }
    },
    { new: true },
    (err, newToken) => {
      if (err)
        return res
          .status(500)
          .send({ message: "failed to save newly created token .." });
      res.status(200).send({ token: newToken["token"] });
    }
  );
};

module.exports = {
  verifyToken,
  generateToken,
  refreshToken
};
