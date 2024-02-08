const httpStatus = require("http-status");
const app = require("./app");
const config = require("./config");
const port = config.port || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${config.database_usernames}:${config.database_passwords}@cluster0.cqqhz9d.mongodb.net/?retryWrites=true&w=majority`;
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

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
const taskCollection = client.db("task_management").collection("tasks");

//@ Register A New User =>
app.post("/api/v1/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Email already exists" });
    }
    const saltRounds = 10;
    let hashPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
    const result = await userCollection.insertOne({
      email,
      hashPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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

//@ All Users =>
app.get("/api/v1/auth", async (req, res) => {
  try {
    const result = await userCollection.find().toArray();
    res
      .status(httpStatus.OK)
      .json({ message: "All users found successfully", data: result });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
});

//@ Get All Task =>

app.get("/api/v1/task", async (req, res) => {
  try {
    const result = await taskCollection.find({}).toArray();

    res
      .status(httpStatus.OK)
      .json({ message: "All task found successfully", data: result });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
});

//@ Get Single Task =>
app.get("/api/v1/task/:id", async (req, res) => {
  try {
    const result = await taskCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.status(httpStatus.OK).json({
      message: "Specific user task found successfully",
      data: result,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

//@ Get Single Task By Using UserId =>
app.get("/api/v1/task/user/:id", async (req, res) => {
  const { searchParams, page, limit, sortBy, sortOrder } = req.query;
  let query = { userId: req.params.id };

  if (searchParams) {
    query.$or = [
      { title: { $regex: searchParams, $options: "i" } },
      { description: { $regex: searchParams, $options: "i" } },
    ];
  }

  const sortOptions = {};
  if (sortBy && sortOrder) {
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  try {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 6;
    const skip = (pageNumber - 1) * pageSize;
    const totalCount = await taskCollection.countDocuments(query);
    const result = await taskCollection
      .find(query)
      .skip(skip)
      .limit(pageSize)
      .sort(sortOptions)
      .toArray();
    res.status(httpStatus.OK).json({
      message: "Specific user task found successfully",
      meta: {
        totalCount: totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      data: result,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

//@ Create A New Task =>
app.post("/api/v1/task", async (req, res) => {
  try {
    const result = await taskCollection.insertOne({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!result) {
      res
        .status(httpStatus.CONFLICT)
        .json({ message: "Failed to create a new task", data: result });
    }
    res
      .status(httpStatus.OK)
      .json({ message: "New task created successfully", data: result });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
});

//@ Update A Task =>
app.patch("/api/v1/task/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const data = req.body;

    let updateData = {};
    if (data.title) {
      updateData.title = data.title;
    }
    if (data.description) {
      updateData.description = data.description;
    }

    if (data.priority) {
      updateData.priority = data.priority;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    const result = await taskCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updateData }
    );
    res
      .status(httpStatus.OK)
      .json({ message: "Task updated successfully", data: result });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
});

//@ Delete A Task =>
app.delete("/api/v1/task/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await taskCollection.deleteOne({
      _id: new ObjectId(taskId),
    });
    if (result.deletedCount === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Task not found for deletion" });
    }
    return res
      .status(httpStatus.OK)
      .json({ message: "Task deleted successfully", data: result });
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
