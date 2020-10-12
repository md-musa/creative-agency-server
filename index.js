const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {ObjectId} = require("mongodb");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
// ---START------MongoDB connection---------
const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://organicUser:quvqc8ro@cluster0.iiaf1.mongodb.net/volunteer-network?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// ---END------MongoDB connection---------

client.connect((err) => {
  // Volunteer activities collection database
  const volunteerActivitiesCollection = client
    .db("volunteer-network")
    .collection("volunteer-work");

  // All Event Collection database
  const eventCollection = client
    .db("volunteer-network")
    .collection("event-list");

  console.log("connected with mongoDB");

  //  [START]-----All event collection send to home---------
  app.get("/event-collection", (req, res) => {
    eventCollection.find({}).toArray((err, documents) => {
      console.log(documents);
      res.send(documents);
    });
  });
  //  [END]-----All event collection send to home-----------

  // [START]-----Single volunteer joined event list-----------
  app.get("/get-volunteer-work-list", (req, res) => {
    volunteerActivitiesCollection
      .find({email: req.query.email})
      .toArray((err, documents) => {
        console.log(err, documents);
        res.send(documents);
      });
  });
  // [END]-----Single volunteer joined event list-----------

  // [START]-------Delete Single user registered event
  app.delete("/event-collection/:id", (req, res) => {
    console.log(req.params.id);
    volunteerActivitiesCollection
      .deleteOne({_id: ObjectId(req.params.id)})
      .then((result) => res.send({deleted: true}));
  });
  // [END]-------Delete Single user registered event

  // [START]-------Delete from all registered event
  app.delete("/admin-delete-registered-volunteer/:id", (req, res) => {
    console.log(req.params.id);
    volunteerActivitiesCollection
      .deleteOne({_id: ObjectId(req.params.id)})
      .then((result) => res.send({deleted: true}));
  });
  // [END]-------Delete from all registered event

  app.post("/add-volunteer-work", (req, res) => {
    console.log(req.body);
    volunteerActivitiesCollection.insertOne(req.body).then((result) => {
      res.send({eventAdded: true});
    });
  });

  app.get("/admin/volunteer-register-list", (req, res) => {
    volunteerActivitiesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/add-event", (req, res) => {
    console.log(req.body);
    eventCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send({isImgSubmitted: true});
    });
  });
});

app.listen(5000);
