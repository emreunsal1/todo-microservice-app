const { default: axios } = require("axios");
const { setCookie } = require("../cookie");
const jwt = require("jsonwebtoken");
const { AUTH_TOKEN_COOKIE_NAME, USER_SERVICE_URL } = require("../constants");
const dotenv = require("dotenv");
dotenv.config();

const loginController = async (req, res) => {
  const url = `${USER_SERVICE_URL}/login`;
  try {
    const response = await axios({ method: req.method, url, data: req.body });
    const { _id } = response.data.user;
    var token = jwt.sign({ _id }, process.env.JWT_SECRET_KEY);

    setCookie(res, AUTH_TOKEN_COOKIE_NAME, token);

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /users: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const registerController = async (req, res) => {
  const url = `${USER_SERVICE_URL}/register`;
  try {
    const response = await axios({ method: req.method, url, data: req.body });
    const { _id } = response.data.user;
    var token = jwt.sign({ _id }, process.env.JWT_SECRET_KEY);
    setCookie(res, AUTH_TOKEN_COOKIE_NAME, token);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error in /users: ${error.message}`);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { message: "Internal Server Error" });
  }
};

const logoutController = async (req, res) => {
  res.clearCookie(AUTH_TOKEN_COOKIE_NAME);
  res.send({ success: true });
};

module.exports = { loginController, registerController, logoutController };
