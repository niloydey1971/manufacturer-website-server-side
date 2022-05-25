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

        // get data from mongo db
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = database.find(query)
            const db = await cursor.toArray()
            res.send(db)
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