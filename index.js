const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const objectId = require('mongodb').ObjectId
var cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
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



        // get data by filtering Query..........
        app.get('/orders', async (req, res) => {
            const email = req.query.email
            const query = { uEmail: email }
            const cursor = orderCollection.find(query)
            const filter = await cursor.toArray()
            res.send(filter)
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

        // delete a single User
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: objectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })

        // users data server
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await pcUsers.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
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