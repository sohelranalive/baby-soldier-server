const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect(); 

        const database = client.db("babySoldier");
        const toysCollection = database.collection("toys");

        //insert data into db
        app.post('/addToys', async (req, res) => {
            const toyInfo = req.body
            toyInfo.price = parseInt(toyInfo.price)

            const result = await toysCollection.insertOne(toyInfo)
            res.send(result)
        })

        //retrieves all data from db but made a limit
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

        //retrieves multiple data based on query and sort
        app.get('/myToys', async (req, res) => {

            const sort = req.query.sort;
            const filter = { seller_email: req.query.email }

            if (sort === 'asc') {
                const options = {
                    sort: { price: 1 },
                }
                const result = await toysCollection.find(filter, options).toArray()
                res.send(result)
                // console.log(filter, options);

            }
            else if (sort === 'des') {
                const options = {
                    sort: { price: -1 },
                }
                const result = await toysCollection.find(filter, options).toArray()
                res.send(result)
                // console.log(filter, options);
            }
            else {
                const result = await toysCollection.find(filter).toArray()
                res.send(result)
                // console.log(filter);
            }

        })

        app.get('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result)
        })

        //retrieve single toy details items as per id
        app.get('/toyDetails/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })

        //delete single item as per id, delete method
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result)
        })

        //update the existing data using patch method
        app.patch('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const info = req.body;
            const filter = { _id: new ObjectId(id) };

            const updatedInfo = {
                $set: {
                    price: parseInt(info.price),
                    quantity: info.quantity,
                    description: info.description
                },
            };
            const result = await toysCollection.updateOne(filter, updatedInfo);
            res.send(result)
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