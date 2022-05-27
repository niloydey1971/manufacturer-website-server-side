const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const objectId = require('mongodb').ObjectId
var cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
require('dotenv').config();
const port = process.env.PORT || 4000;

// database connection..............
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pegsuub.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// data CRUD...............
async function run() {
    try {
        await client.connect();
        const database = client.db('pchutCollection').collection('pcParts');
        const orderCollection = client.db('pchutCollection').collection('pcOrders');
        const reviewCollection = client.db('pchutCollection').collection('pcReviews');

        // get data from mongo db
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = database.find(query)
            const db = await cursor.toArray()
            res.send(db)
        })

        // get data via params
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: objectId(id) }
            const cursor = database.find(query)
            const db = await cursor.toArray()
            res.send(db)
        })

        // post data to Mongo DB
        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send({ ack: "order added to server" })
        })


        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send({ ack: "review added to server" })
        })

    } finally {

    }

}
run().catch(console.dir);

// check the server..............
app.get('/', (req, res) => {
    res.send("Running my Server!")
})

app.listen(port, () => {
    console.log("Listening port 4000")
})