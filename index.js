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

app.get('/', (req, res) => {
    res.send("Running my Server!")
})

app.listen(port, () => {
    console.log("Listening port 4000")
})