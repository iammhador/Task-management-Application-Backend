require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  database_usernames: process.env.DATABASE_USERNAME,
  database_passwords: process.env.DATABASE_PASSWORD,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_In: process.env.JWT_EXPIRES_IN
};
