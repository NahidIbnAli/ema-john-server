const exprees = require("express");
const cors = require("cors");
require("dotenv").config();
const app = exprees();
const port = process.env.PORT | 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(exprees.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wgjxpn1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req, res) => {
  res.send("Yap, I can run on the web.");
});

async function run() {
  try {
    const productCollection = client.db("emaJohn").collection("products");

    app.get("/products", async (req, res) => {
      const query = {};
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const cursor = productCollection
        .find(query)
        .skip(page * size)
        .limit(size);
      const products = await cursor.toArray();
      const count = await productCollection.estimatedDocumentCount();
      res.send({ products, count });
    });

    app.post("/productsByIds", async (req, res) => {
      const ids = req.body;
      const objectIds = ids.map((id) => ObjectId(id));
      const query = { _id: { $in: objectIds } };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log("server running on port :", port);
});
