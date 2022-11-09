const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            // console.log(page, size)
            const query = {}
            const cursor = Service.find(query);
            const services = await cursor.skip(page * size).limit(size).toArray();
            const count = await Service.estimatedDocumentCount();
            res.send({ count, services });
        })


        app.post('/services', async (req, res) => {
            const course = req.body;
            const result = await Service.insertOne(course);
            res.send(result);
        });


        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
           
            const service = await Service.findOne(query);
            res.send(service);
        });


        app.get('/reviews/filter', async (req, res) => {
            
            const id = req.query.id;
            const email = req.query.email;
            let query;
            if(id){
                query = { course_Id:  id };
            }else{
                query = { email: email };
            }
           
            const reviews = await Review.find(query).toArray();
            // console.log(reviews)
            res.send(reviews);
        });



        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await Review.insertOne(review);
            res.send(result);
        });


        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await Review.deleteOne(query);
            console.log(result);
            res.send(result);
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
