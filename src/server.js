const httpStatus = require("http-status");
const app = require("./app");
const config = require("./config");
const port = config.port || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${config.database_usernames}:${config.database_passwords}@cluster0.cqqhz9d.mongodb.net/?retryWrites=true&w=majority`;
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("🛢 Database is connected successfully");
  } catch (error) {
    console.log(error);
  }
}

//@ Database Collection =>
const userCollection = client.db("task_management").collection("users");

//@ Register A New User =>
app.post("/api/v1/auth/register", async (req, res) => {
  try {
    const saltRounds = 10;
    const { email, password } = req.body;
    let hashPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
    const result = await userCollection.insertOne({ email, hashPassword });
    res
      .status(httpStatus.OK)
      .json({ message: "User created successfully", data: result });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
});

//@ Login A New User =>
app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const hash = user.hashPassword;
    bcrypt.compare(password, hash, function (err, result) {
      if (!result) {
        return res
          .status(httpStatus.NOT_ACCEPTABLE)
          .json({ message: "Password does not match" });
      }
      const token = jwt.sign(
        {
          userInfo: user,
        },
        config.jwt_secret,
        { expiresIn: config.jwt_expires_In }
      );
      console.log(token);
      res
        .status(httpStatus.OK)
        .json({ message: "User found successfully", data: { user, token } });
    });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
});

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Task management application is listening on port ${port}`);
});
