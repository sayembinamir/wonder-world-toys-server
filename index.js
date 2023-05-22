const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xxinnyi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run()
{
  try
  {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const allToysCollection = client.db('wonderWorldToys').collection('allToys');


    app.post("/animals", async (req, res) => {
      const newToy = req.body;
      const result = await allToysCollection.insertOne(newToy);
      res.send(result);
  }); 


  app.get("/toyAll", async (req, res) => {
    const result = await allToysCollection.find().limit(20).toArray();
    console.log(result);
    res.send(result);

  });

  app.get("/toys/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await allToysCollection.findOne(query);
    res.send(result);
  });


  app.get("/allToysByCategory/:category", async (req, res) => {
    const toys = await allToysCollection.find({
        subCategory: req.params.category,
      })
      .toArray();
    res.send(toys);
  });

  app.put("/toys/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateToy = req.body;
    const toy = {
      $set: {
        price: updateToy.price,
        quantity: updateToy.quantity,
        description: updateToy.description,
      },
    };
    const result = await allToysCollection.updateOne(filter, toy, options);
    res.send(result);
  });

  app.delete("/toys/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await allToysCollection.deleteOne(query);
    res.send(result);
  });



    app.get('/myToy', async (req, res) =>{
      const type = req.query.type == "ascending";
      const value = req.query.value;
      let query = {};
      if(req.query.email) {
        query = { sellerEmail: req.query.email };
      }
      let sortObj = {};
      sortObj[value] = type ? 1 : -1;
      const result = await allToysCollection.find(query).sort(sortObj).toArray();
      res.send(result);
    })

    app.get("/getToysName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await allToysCollection.find({
          $and: [
            { toyName: text }
          ],
        }).toArray();
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally
  {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) =>
{
  res.send('Animals Toy Is Running')
})

app.listen(port, () =>
{
  console.log(`Animals Toy Is Running port ${port}`)
})
