const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');

// MiddleWare
app.use(cors());
app.use(express.json());
// ----------------------------

// MongoDB Code
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATA_USER}:${process.env.DATA_PASS}@cluster0.jlpngjm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toyCollection = client.db('marvelUniverse').collection('toyCollection');
    const galleryToyCollection = client.db('marvelUniverse').collection('galleryToyCollection');

    // All Code For Client Side
    // -------------------------

    // Get Gallery Toys Data
    app.get('/toyGallery', async (req, res) => {
      const result = await galleryToyCollection.find().toArray();
      res.send(result);
    })

    app.get('/toys', async (req, res) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      const skip = page * limit;
      const searchName = req.query.name; // Get the toy name from the query parameters
      const query = searchName ? { toyName: { $regex: searchName, $options: 'i' } } : {}; // Create the query object
      
      const result = await toyCollection.find(query).skip(skip).limit(limit).toArray();
      res.send(result);
    });
    

    // Find Specific Data Using Email
    app.get('/toys/email', async (req, res) => {
      console.log(req.query.sort);
      console.log(req.query.order);
      let query = {};
      if (req.query.email) {
        query = { sellerEmail: req.query.email }
      }
      const sortField = req.query.sort || 'price';
      const sortOrder = parseInt(req.query.order) || 1;
      const result = await toyCollection.find(query).sort({ [sortField]: sortOrder }).toArray();
      res.send(result);
    })


    // Find Single Toy
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    })


    // Find By Category Data
    app.get('/toys/category/:category', async (req, res) => {
      const category = req.params.category;
      console.log(category);
      let query = {};
      if (category) {
        query = { category: category }
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })

    // Total Toys Count
    app.get('/totalToys', async (req, res) => {
      const result = await toyCollection.estimatedDocumentCount();
      res.send({ totalToys: result });
    })

    // Add Toys
    app.post('/toys', async (req, res) => {
      const toy = req.body;
      const addNewToy = await toyCollection.insertOne(toy);
      res.send(addNewToy);
    })

    // Update Toy
    app.put('/toys/:id', async (req, res) => {
      const toyId = req.params.id;
      const updatedToy = req.body;
      const filter = { _id: new ObjectId(toyId) };
      const options = { upsert: true };
      const toy = {
        $set: {
          toyName: updatedToy.toyName,
          category: updatedToy.category,
          description: updatedToy.description,
          toyPhoto: updatedToy.toyPhoto,
          price: updatedToy.price,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          sellerName: updatedToy.sellerName,
          sellerEmail: updatedToy.sellerEmail
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    })

    // Delete Toy
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// Start
app.get('/', (req, res) => {
  res.send('Marvel Universe Running')
});
app.listen(port, (req, res) => {
  console.log(`Marvel Universe Server Running on Port: ${port}`);
});