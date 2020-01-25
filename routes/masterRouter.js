var express = require("express");
var masterRouter = express.Router();

var userController = require("../controllers/UserController")

//status router
masterRouter.route("/status").get(userController.getStatus);
masterRouter.route("/user/signup").post(userController.createUser);

module.exports = masterRouter;