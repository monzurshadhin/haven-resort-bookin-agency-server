const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2qgnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


async function run() {
    try {
      await client.connect();
      const database = client.db("EpicResortBooking");
      const offersCollection = database.collection("offers");
      const blogsCollection = database.collection("blogs");
      const bookingCollection = database.collection("bookings");
      const reviewsCollection = database.collection("reviews");
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
  