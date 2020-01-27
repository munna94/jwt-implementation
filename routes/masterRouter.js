//@Author: MUNNA KUMAR SAH
//Copyright 2013,All rights reserved.


var express = require("express");
var masterRouter = express.Router();

var userController = require("../controllers/UserController")
var authController = require("../controllers/AuthController")
//status router
masterRouter.route("/status").get(userController.getStatus);
masterRouter.route("/user/register").post(userController.register);
masterRouter.route("/user/login/:id").post(userController.login);
masterRouter.route("/user/logout/:id").post(userController.logout);
masterRouter.route("/user/generate/token").post(authController.generateToken);
masterRouter.route("/user/verify/token").get(authController.verifyToken);

module.exports = masterRouter;