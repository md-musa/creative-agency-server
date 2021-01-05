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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iiaf1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// ---END------MongoDB connection---------

client.connect((err) => {
  console.log("--MongoBD connected", err);
  const usersCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("users");

  // Sign up
  app.post("/signup", (req, res) => {
    console.log(req.body);
    usersCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Sign in
  app.get("/signIn/:email/:password", (req, res) => {
    console.log(req.params);
    const {email, password} = req.params;
    usersCollection.find({email, password}).toArray((err, documents) => {
      if (documents.length > 0) {
        res.send({isExistUser: true});
      } else res.send({isExistUser: false});
    });
  });

  // Update wpm data
  app.patch("/updateWpm", (req, res) => {
    const {email, newWpm} = req.body;
    usersCollection.find({email}).toArray((err, documents) => {
      const wpmArr = documents[0].wpmData;
      usersCollection
        .updateOne(
          {email},
          {
            $set: {wpmData: [...wpmArr, newWpm]},
          }
        )
        .then((result) => {
          console.log(result);
          res.send([...wpmArr, newWpm]);
        });
    });
  });
});

app.get("/", (req, res) => {
  res.send("working fine ");
});

app.listen(process.env.PORT || 5000);

// const reviewsCollection = client.db("creative-agency").collection("all-reviews");
// const servicesCollection = client.db("creative-agency").collection("all-services");
// const adminCollection = client.db("creative-agency").collection("all-admin");
// console.log("-----MongoDB Connected")

// // --------[START]-----Place new order---------------
// app.post("/subscribeToService", (req, res) => {
//   const {name, email, service, description, price, status, image} = req.body;
//   ordersCollection
//     .insertOne({name, email, service, description, price, status, image})
//     .then((result) => {
//       res.send(result.insertedCount > 0);
//     });
// });
// // --------[END]-----Place new order---------------

// //---------[START]-----Add review from client----------
// app.post("/addReview", (req, res) => {
//   reviewsCollection.insertOne(req.body).then((result) => {
//     res.send(result.insertedCount > 0);
//   });
// });
// //---------[END]-----Add review from client----------

// //-------[START]--------ADD new service ------------
// app.post("/addNewService", (req, res) => {
//   const file = req.files.file;
//   const title = req.body.service;
//   const description = req.body.description;
//   const readImg = file.data;
//   const base64 = readImg.toString("base64");

//   const image = {
//     contentType: req.files.file.mimetype,
//     size: req.files.file.size,
//     img: Buffer.from(base64, "base64"),
//   };

//   servicesCollection.insertOne({ title: title, description: description, image: image }).then(() => {
//     res.end();
//   });
// });
// //-------[END]--------ADD new service ----------------------

// // -------[START]------Add new admin---------------------------
// app.post("/addNewAdmin", (req, res) => {
//   adminCollection.insertOne(req.body).then((result) => {
//     res.send(result.insertedCount > 0);
//   });
// });
// // -------[END]------Add new admin----------------------------

// //--------[START]-----Send all clilent registered services list-------
// app.get("/allRegisteredServices", (req, res) => {
//   ordersCollection.find({}).toArray((err, documents) => {
//     res.send(documents);
//   });
// });
// //--------[END]-----Send All clilent registered services list-------

// // -------[START]----send all service from service's collection---------------
// app.get("/services", (req, res) => {
//   servicesCollection.find({}).toArray((err, documents) => {
//     res.send(documents);
//   });
// });
// // -------[END]----send all service from service's collection---------------

// // ------[START]--------send all review from review's collection------------
// app.get("/reviews", (req, res) => {
//   reviewsCollection.find({}).toArray((err, documents) => {
//     res.send(documents);
//   });
// });
// // ------[END]--------send all review from review's collection----------------

// //----[START]--Send Single client registered services--------------
// app.get("/Single-client-registered-services/:email", (req, res) => {
//   ordersCollection
//     .find({email: req.params.email})
//     .toArray((err, documents) => {
//       res.send(documents);
//     });
// });
// //----[END]-- Send Single client registered services------------

// //------[START]----send all orders from order's collection------
// app.get("/orders", (req, res) => {
//   ordersCollection.find({}).toArray((err, documents) => {
//     res.send(documents);
//   });
// });
// //------[END]----send all orders from order's collection------

// //----[START] ----------Update order status-------------
// app.patch("/updateStatus", (req, res) => {
//   ordersCollection
//     .updateOne(
//       {_id: ObjectId(req.body.id)},
//       {
//         $set: {status: req.body.changedStatus},
//       }
//     )
//     .then((result) => {
//       res.send(result);
//     });
// });
// //----[END] ----------Update order status-------------

// // -----[START]-----Admin email matching-----------
// app.get("/isAdminExist/:email", (req, res) => {
//   adminCollection
//     .find({email: req.params.email})
//     .toArray((err, documents) => {
//       res.send(documents);
//     });
// });
// // -----[END]-----Admin email matching-----------
