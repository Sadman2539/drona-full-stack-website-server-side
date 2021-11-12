const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
// require dotenv file 
require('dotenv').config();

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
        app.post('/orders', async (req, res) => {
            const product = req.body;
            const result = await orderCollection.insertOne(product);
            console.log(result);
            res.json(result);
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