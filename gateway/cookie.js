const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { ONE_YEAR_AS_MS } = require("./constants");
dotenv.config();

const setCookie = (
  res,
  cookieName,
  cookieValue,
  options = {
    maxAge: ONE_YEAR_AS_MS,
  }
) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    maxAge: options.maxAge,
  };

  if (isProduction) {
    cookieOptions.httpOnly = true;
  }

  res.cookie(cookieName, cookieValue, cookieOptions);
};

const secretKey = process.env.JWT_SECRET_KEY;

const generateJwt = async (user) => {
  try {
    const generatedJWT = await jwt.sign(user, secretKey, {
      expiresIn: "7d",
    });
    return generatedJWT;
  } catch (error) {
    console.log({
      action: "GENERATE_JWT_ERROR",
      message: "not created",
      errorStack: error,
    });
    return false;
  }
};

const verifyJwt = (token) => {
  try {
    const payload = jwt.verify(token, secretKey);
    if (!payload) {
      console.log("[verifyJwt] verify error", payload);
      return false;
    }
    return payload;
  } catch (err) {
    console.log({
      action: "JWT_VERIFY_ERROR",
      message: "not verified",
      errorStack: err,
    });
    return false;
  }
};

module.exports = { generateJwt, verifyJwt, setCookie };
