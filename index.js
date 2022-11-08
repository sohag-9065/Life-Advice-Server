const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// middleware 
app.use(cors());
app.use(express.json());

const data = require('./data/data.json');
// console.log(data)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akdywg4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const Service = client.db('life_advice').collection('services');
        const Review = client.db('life_advice').collection('reviews');

        app.get('/services', async (req, res) => {
            const services = await Service.find().toArray();
            res.send(services);
        })

        // const options = { ordered: true };
        // const result = await Service.insertMany(data, options);


        console.log("DB connect")

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Hello from Life Advice!")
})

app.listen(port, () => {
    console.log(`Life Advice app listening on port ${port}`)
})
