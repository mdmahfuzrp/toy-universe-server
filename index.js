const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// MiddleWare
app.use(cors());
app.use(express.json());
// ----------------------------

// MongoDB Code
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    await client.connect();

    const toyCollection = client.db('marvelUniverse').collection('toyCollection');

    // All Code For Client Side
    // -------------------------
    
    // Add Toys
    app.post('/toys', async(req, res)=>{
        const toy = req.body;
        const addNewToy = await toyCollection.insertOne(toy);
        res.send(addNewToy);
    })
    // Get Toys
    app.get('/toys', async(req, res)=>{
        const result = await toyCollection.find().toArray();
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
app.get('/', (req, res)=>{
    res.send('Marvel Universe Running')
});
app.listen(port, (req, res)=>{
    console.log(`Marvel Universe Server Running on Port: ${port}`);
});