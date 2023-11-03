const app = require("./app");
const config = require("./config");
const port = config.port || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${config.database_usernames}:${config.database_passwords}@cluster0.cqqhz9d.mongodb.net/?retryWrites=true&w=majority`;

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
    app.listen(port, () => {
      console.log(
        `🛢 Database is connected successfully & application is listening on port ${port}`
      );
    });
  } catch (error) {
    console.log(error);
  }
}

run().catch(console.dir);
