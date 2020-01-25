var express = require("express");
var router = express.Router();

var User = require("../models/user");
console.log("called... method");


let getStatus = function(req, res) {
  res.status(200).send({ status: "success" });
};

const createUser = (req, res) => {
  User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      mobile:req.body.mobile
    },
    function(err, user) {
      if (err)
        res
          .status(500)
            .send({ "error": err });
      else res.status(200).send(user);
    }
  );
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
  createUser
};
