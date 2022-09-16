const express = require("express");
const passport = require("passport");

const {
  renderRegister,
  register,
  renderLogin,
  login,
  logout,
} = require("../controllers/users");

const router = express.Router();

router.route("/register").get(renderRegister).post(register);

router
  .route("/login")
  .get(renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
      keepSessionInfo: true,
    }),
    login
  );

router.post("/logout", logout);

module.exports = router;
