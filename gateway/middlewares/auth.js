const User = require("../../user-service/models/User");
const { AUTH_TOKEN_COOKIE_NAME } = require("../constants");
const { verifyJwt } = require("../cookie");
const dotenv = require("dotenv");
dotenv.config();

const AUTH_REQUIRED_MIDDLEWARE = async (req, res, next) => {
  const authToken = req.cookies[AUTH_TOKEN_COOKIE_NAME];
  if (!authToken) {
    res.status(401).send("Unauthorized");
    return;
  }

  const data = verifyJwt(authToken);
  if (!data) {
    res.status(401).send("Unauthorized");
    return;
  }
  req.user = data;
  next();
};

const AUTH_REQUIRED_MIDDLEWARE_REDIRECT = async (req, res, next) => {
  try {
    if (!req.cookies || !req.cookies[AUTH_TOKEN_COOKIE_NAME]) {
      return res.redirect("/pages/login.html");
    }

    const authToken = req.cookies[AUTH_TOKEN_COOKIE_NAME];

    const data = verifyJwt(authToken);
    if (!data) {
      return res.redirect("/pages/login.html");
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.redirect("/pages/login.html");
  }
};

module.exports = {
  AUTH_REQUIRED_MIDDLEWARE,
  AUTH_REQUIRED_MIDDLEWARE_REDIRECT,
};
