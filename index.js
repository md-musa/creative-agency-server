const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {ObjectId} = require("mongodb");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(fileUpload());

// ---START------MongoDB connection---------
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iiaf1.mongodb.net/creative-agency?retryWrites=true&w=majority`;

// const uri =
//   "mongodb+srv://organicUser:quvqc8ro@cluster0.iiaf1.mongodb.net/creative-agency?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ---END------MongoDB connection---------

client.connect((err) => {
  console.log("error", err);
  const ordersCollection = client
    .db("creative-agency")
    .collection("all-orders");
  const reviewsCollection = client
    .db("creative-agency")
    .collection("all-reviews");
  const servicesCollection = client
    .db("creative-agency")
    .collection("all-services");
  const adminCollection = client.db("creative-agency").collection("all-admin");

  console.log("----MongoDB connected");
  // ----------start from here-----------------

  // --------[START]-----Place new order---------------
  app.post("/subscribeToService", (req, res) => {
    const file = req.files.file;
    const {name, email, service, description, price} = req.body;
    console.log(file, service, description, name, email, price);

    const filePath = `${__dirname}/images/${file.name}`;
    file.mv(filePath, (err) => {
      if (err) {
        res.send({massege: "failed to upload"});
      }
      const newImage = fs.readFileSync(filePath);
      const encImage = newImage.toString("base64");
      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer(encImage, "base64"),
      };

      ordersCollection
        .insertOne({name, email, service, description, price, image})
        .then((result) => {
          fs.remove(filePath, (err) => {
            if (err) {
              return res.send({massege: "failed to uploade"});
            }
          });
          console.log(result);
          res.send(result.insertedCount > 0);
        });
    });
  });
  // --------[END]-----Place new order---------------

  //---------[START]-----Add review from client----------
  app.post("/addReview", (req, res) => {
    reviewsCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });
  //---------[END]-----Add review from client----------

  //-------[START]--------ADD new service ------------
  app.post("/addNewService", (req, res) => {
    const file = req.files.file;
    const service = req.body.service;
    const description = req.body.description;

    const filePath = `${__dirname}/images/${file.name}`;
    file.mv(filePath, (err) => {
      if (err) {
        res.send({massege: "failed to upload"});
      }
      const newImage = fs.readFileSync(filePath);
      const encImage = newImage.toString("base64");
      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer(encImage, "base64"),
      };

      servicesCollection
        .insertOne({service, description, image})
        .then((result) => {
          fs.remove(filePath, (err) => {
            if (err) {
              return res.send({massege: "failed to uploaded"});
            }
          });
          console.log(result);
          res.send(result.insertedCount > 0);
        });
    });
  });
  //-------[END]--------ADD new service ------------

  // -------[START]------Add new admin----------
  app.post("/addNewAdmin", (req, res) => {
    console.log(req.body.email);
    adminCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });
  // -------[END]------Add new admin----------

  //--------[START]-----All clilent registered services list-------
  app.get("/allRegisteredServices", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      console.log(documents);
      res.send(documents);
    });
  });
  //--------[END]-----All clilent registered services list-------

  app.get("/services", (req, res) => {
    servicesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // get all reviews
  app.get("/reviews", (req, res) => {
    reviewsCollection.find({}).toArray((err, documents) => {
      console.log(documents, err);
      res.send(documents);
    });
  });

  //----[START]--Single client registered services
  app.get("/Single-client-registered-services/:email", (req, res) => {
    console.log(req.params.email);
    ordersCollection
      .find({email: req.params.email})
      .toArray((err, documents) => {
        console.log(documents, err);
        res.send(documents);
      });
  });
  //----[END]--Single client registered services

  //all orders
  app.get("/orders", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      console.log(documents, err);
      res.send(documents);
    });
  });

  //Upgrade order status like pending, on going , done
  app.patch("/updateOrderStatus/:id", (req, res) => {
    ordersCollection
      .updateOne(
        {_id: ObjectId(req.params.id)},
        {
          $set: {status: req.body.status},
        }
      )
      .then((result) => {
        console.log(result);
      });
  });
});
app.get("/", (req, res) => {
  res.send("workig fine ");
});

app.listen(process.env.PORT || 5000);
