const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// middleware 
app.use(cors());
app.use(express.json());

const data = require('./data/data.json');
// console.log(data)

// mongoDB connet uri 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akdywg4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// authorization check unction 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log("first")
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        // create database collection 
        const Service = client.db('life_advice').collection('services');
        const Review = client.db('life_advice').collection('reviews');

        // create toekn 
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        });

        // app.get('/services', async (req, res) => {
        //     const query = {}
        //     const cursor = Service.find(query).sort({postTime: -1});
        //     const services = await cursor.toArray();
        //     res.send( services );
        // })

        // get services/courses depends on page & size 
        app.get('/services', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            // console.log(page, size)
            const query = {}
            const cursor = Service.find(query).sort({postTime: -1});
            const services = await cursor.skip(page * size).limit(size).toArray();
            const count = await Service.estimatedDocumentCount();
            res.send({ count, services });
        })

        // add  services/courses 
        app.post('/services', verifyJWT, async (req, res) => {
            const course = req.body;
            const result = await Service.insertOne(course);
            res.send(result);
        });

        // get single  service/course  by service ID
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await Service.findOne(query);
            res.send(service);
        });

        // get reviews    by service ID or User all reviews
        app.get('/reviews/filter', async (req, res) => {
            const id = req.query.id;
            const email = req.query.email;
            let query;
            if(id){
                query = { course_Id:  id };
            }else{
                query = { email: email };
            }
            const reviews = await Review.find(query).sort({postTime: -1}).toArray();
            // console.log(reviews)
            res.send(reviews);
        });

        // add review 
        app.post('/reviews', verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await Review.insertOne(review);
            res.send(result);
        });

        // update review 
        app.patch('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const review = req.body
            // console.log(review);
            // console.log(id)
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: review
            }
            const result = await Review.updateOne(query, updatedDoc);
            res.send(result);
            // const count = await Service.estimatedDocumentCount();
            // res.send({ count });
        })

        // delete review 
        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
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
