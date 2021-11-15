const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const admin = require("firebase-admin");

// drona-firebase-adminsdk.json

var serviceAccount = require("./drona-firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// require dotenv file 
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

// Connect app with mongoDB database
const { MongoClient } = require('mongodb');

// use cors as middleware
app.use(cors());
app.use(express.json());

// connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vipdf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// verifyToken function call to verify token
async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startWith('Bearer ')) {
        const token = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        } catch (error) {
            res.status(401).send('Unauthorized');
        }
        next();

    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
    next();
}

async function run() {
    try {
        await client.connect();
        const database = client.db("drona");
        const orderCollection = database.collection("orders");
        const productCollection = database.collection("products");
        const reviewCollection = database.collection("reviews");
        const blogCollection = database.collection("blogs");
        const usersCollection = database.collection("users");


        //GET API (ALL Products)
        app.get('/explore', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);

        });

        //GET Single Product 
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific id');
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);
        })

        // post Single Product
        app.post('/explore', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result);
        });

        //GET API (Reviews)
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);

        });
        // post single Review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });
        // GET ALL (orders)
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);


        });
        // GET API(orders)
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);

        });

        // post all orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });
        // GET API(blogs)
        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find({});
            const blogs = await cursor.limit(6).toArray();
            res.send(blogs);

        });

        // post all blogs
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            const result = await blogCollection.insertOne(blog);
            console.log(result);
            res.json(result);
        });




        //Delete API(order)
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('deleting specific id');
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
        //Delete API(Product)
        app.delete('/explore/:id', async (req, res) => {
            const id = req.params.id;
            console.log('deleting specific id');
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })




        // post new Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        // PUT new Users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updatedUser = { $set: user };
            const result = await usersCollection.updateOne(filter, updatedUser, options);
            res.json(result);
        });
        // PUT ADMIN 
        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updatedUser = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updatedUser);
                    res.json(result);

                }


            }
            else {
                res.status(403).json({
                    message: "You don't have access to make an admin"
                });
            }

        });

        // FIND  ADMIN 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }

            res.json({ admin: isAdmin });
        });

        // GET  Users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);

        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello drone lovers!')
})

app.listen(port, () => {
    console.log(`Listening at port ${port}`)
})