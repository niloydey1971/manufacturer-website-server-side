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


// verify JWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access. Please Login or Register' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access, Please Login or Register' })
        }
        req.decoded = decoded;
        next();
    });
}

// data CRUD...............
async function run() {
    try {
        await client.connect();
        const database = client.db('pchutCollection').collection('pcParts');
        const orderCollection = client.db('pchutCollection').collection('pcOrders');
        const reviewCollection = client.db('pchutCollection').collection('pcReviews');
        const userCollection = client.db('pchutCollection').collection('pcUsers');

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
        app.post('/products', async (req, res) => {
            const product = req.body
            const result = await database.insertOne(product)
            res.send({ ack: "product added to server" })
        })



        // get data by filtering Query..........
        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { uEmail: email }
                const cursor = orderCollection.find(query)
                const filter = await cursor.toArray()
                return res.send(filter)

            }
            else {
                return res.status(403).send({ message: 'forbidden access, Please Login' });
            }

        })

        // post data to Mongo DB
        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send({ ack: "order added to server" })
        })

        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            const db = await cursor.toArray()
            res.send(db)
        })


        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send({ ack: "review added to server" })
        })

        // delete a single item
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: objectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })

        // delete a single User
        app.delete('/user/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })

        // users data server

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        app.post('/user', async (req, res) => {
            const p = req.body
            const result = await userCollection.insertOne(p)
            res.send({ ack: "Profile Update" })
        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }

        })


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
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