const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3krokas.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect(); 

        const database = client.db("babySoldier");
        const toysCollection = database.collection("toys");

        app.post('/addToys', async (req, res) => {
            const toyInfo = req.body
            const result = await toysCollection.insertOne(toyInfo)
            res.send(result)
        })

        app.get('/allToys', async (req, res) => {

            const limit = 20;

            if (req.query?.category) {
                const filter = { category: req.query.category }
                const result = await toysCollection.find(filter).toArray()
                res.send(result)
            }

            else {
                const result = await toysCollection.find().limit(limit).toArray()
                res.send(result)
            }

        })

        app.get('/myToys', async (req, res) => {
            const filter = { seller_email: req.query.email }
            const result = await toysCollection.find(filter).toArray()
            res.send(result)
        })
        app.get('/toyDetails/:id', async (req, res) => {
            const id = req.id
            console.log(id);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toys- Baby Soldier Server is running')
})

app.listen(port, () => {
    console.log(`Toy Server is running on port: ${port}`);
})