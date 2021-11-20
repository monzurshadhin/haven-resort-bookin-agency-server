const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();


const app = express();
const port = process.env.PORT || 5000;

const serviceAccount = require(`./epic-resort-booking-agency-firebase-adminsdk-exivy-efed7b3a05.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2qgnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function verifyToken(req, res, next) {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    } catch {}
  }
  next();
}


async function run() {
    try {
      await client.connect();
      const database = client.db("EpicResortBooking");
      const offersCollection = database.collection("offers");
      const blogsCollection = database.collection("blogs");
      const bookingCollection = database.collection("bookings");
      const reviewsCollection = database.collection("reviews");
      const usersCollection = database.collection("users");

    //   const registerCollection = database.collection("register_event");
      console.log('db connected successfully');
    // get all api data  form offer collection 
    app.get('/offers',async(req,res)=>{
        
        const cursor = offersCollection.find({});
        const offers =await cursor.toArray();
        res.send(offers)
      
      });

       // insert offer 
     app.post('/offers',async(req,res)=>{
      const offer = req.body;
      const result = await offersCollection.insertOne(offer);
      res.json(result);
    })

      // get single data from offer collection 
      app.get('/selectedOffer/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await offersCollection.findOne(query);
        res.send(result);
      })

    // get all api data  form blogs collection 
    app.get('/blogs',async(req,res)=>{
        
      const cursor = blogsCollection.find({});
      const blogs =await cursor.toArray();
      res.send(blogs)
    
    });

     // insert booking 
     app.post('/booking',async(req,res)=>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.json(result);
    })

    // get bookings by email 
    app.post('/mybooking', async(req,res)=>{
      const email = req.body.email;
      const query = {email:email}
      const bookings = await bookingCollection.find(query).toArray();
      res.json(bookings)
    })

    // delete booking 
    app.delete('/booking/delete/:id',async(req,res)=>{
      const id = req.params.id;
      
      const query = {_id:ObjectId(id)};
      // console.log(query);
      const result = await bookingCollection.deleteOne(query);
      res.json(result);

    })

    // get all api data  form booking collection 
    app.get('/bookings',async(req,res)=>{
        
      const cursor = bookingCollection.find({});
      const bookings =await cursor.toArray();
      res.send(bookings)
    
    });

    // update approved
    app.put('/booking/update/:id', async(req,res)=>{
      const status = req.body.status;
      const id = req.params.id;
     
      const filter = {_id:ObjectId(id)};
      const options = { upsert: true };
      
      const updateDoc = {
        $set: {
          
          status:status
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      // console.log(result);
      res.send(result);
    })
    
      // get all api data  form review collection 
      app.get('/reviews',async(req,res)=>{
        
        const cursor = reviewsCollection.find({});
        const reviews =await cursor.toArray();
        res.send(reviews);
      
      });

      app.post("/users", async (req, res) => {
        const user = req.body;
        // console.log(user);
        const result = await usersCollection.insertOne(user);
        res.json(result);
      });
      app.put("/users", async (req, res) => {
        const user = req.body;
        console.log(user);
        const filter = { email: user.email };
        const option = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await usersCollection.updateOne(filter, updateDoc, option);
        res.json(result);
      });

      app.put("/users/admin", verifyToken, async (req, res) => {
        const user = req.body;
        console.log(user);
        // console.log(user);
        const requester = req.decodedEmail;
        // console.log(requester);
  
        if (requester) {
          const requesterAccount = await usersCollection.findOne({
            email: requester
          });
          if (requesterAccount.role === "admin") {
            const filter = { email: user.email };
            const updateDoc = {
              $set: { role: "admin" }
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            // console.log(result);
            res.json(result);
          }
        }
        else{
          res.status(403).json({message:'you can not make admin'});
        }
      });

      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
  
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
      });

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("epic resort booking is running");
  });
  app.listen(port, () => {
    console.log("epic resort booking agency running on port number:", port);
  });
  