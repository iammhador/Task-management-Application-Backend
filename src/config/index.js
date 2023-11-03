require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  database_usernames: process.env.DATABASE_USERNAME,
  database_passwords: process.env.DATABASE_PASSWORD,
};
