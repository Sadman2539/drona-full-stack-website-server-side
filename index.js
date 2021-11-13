const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
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

async function run() {
    try {
        await client.connect();
        const database = client.db("drona");
        const orderCollection = database.collection("orders");
        const productCollection = database.collection("products");
        const reviewCollection = database.collection("reviews");
        const blogCollection = database.collection("blogs");


        //GET API (Products)
        app.get('/explore', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.limit(10).toArray();
            res.send(products);

        });
        // post all Products
        app.post('/explore', async (req, res) => {
            const product = req.body;
            const result = await orderCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });
        //GET API (Reviews)
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);

        });
        // post all Reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result);
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


        //GET Single Product 
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific id');
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);
        })

        //Delete API(order)
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('deleting specific id');
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
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