require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const port = process.env.PORT || 5000;

const app = express();


app.use(cors({
  origin: ['http://localhost:5173',
    'https://volunteer-management-3413a.web.app',
    'https://volunteer-management-3413a.firebaseapp.com'


  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH','DELETE'], // Add methods you need
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3jkraio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



// middle ware verify token 

const varifyToken = async (req, res, next) => {
  const token = req.cookies.token
  // console.log('token in middle ware', token);

  if (!token) {
    return res.status(401).send({ message: 'unauthorize access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorize access' })
    }
    req.user = decoded;
    next();
  })


}

async function run() {
  try {


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const volunteersCollection = client.db('volunteerManagement').collection('volunteers');
    const beVolunteersCollection = client.db('volunteerManagement').collection('beVolunteers');

    // auth related api (jwt)
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

        })
        .send({ success: true });
    })


    app.post('/logout', async (req, res) => {


      res.clearCookie('token', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 0
      }).send({ success: true })
    })


    // be a volunteer api
    app.post('/beVolunteer', async (req, res) => {
      const beVolunteer = req.body;
      const query = { postId: beVolunteer.postId, volunteerEmail: beVolunteer.volunteerEmail }
      // const alredyExist = await beVolunteersCollection.findOne(query)
      // if (alredyExist) {
      //   return res.status(400).send({ message: 'already added' })
      // }
      const filtur = { _id: new ObjectId(beVolunteer.postId) }
      const updateDoc = { $inc: { volunteersNeeded: -1 } };
      const updateQuantity = await volunteersCollection.updateOne(filtur, updateDoc)
      const result = await beVolunteersCollection.insertOne(beVolunteer);
      res.send(result);
    })

    // my posted api by email
    app.get('/myPost', varifyToken, async (req, res) => {
      const email = req.query.email;
      if (req.user?.email !== email) {
        return res.status(403).send({ message: 'access forbidden' })
      }
      // console.log(email)
      const result = await volunteersCollection.find({ organizerEmail: email }).toArray();
      res.send(result);
    })

    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...data
        }
      }
      const result = await volunteersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    })


    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteersCollection.deleteOne(query);
      res.send(result);

    });


    // my apply api

    app.get('/myApply', varifyToken, async (req, res) => {
      const email = req.query.email;
      if (req.user?.email !== email) {
        return res.status(403).send({ message: 'access forbidden' })
      }
      // console.log(email)
      const result = await beVolunteersCollection.find({ volunteerEmail: email }).toArray();
      res.send(result);
    });

    app.delete('/deleteApply/:id', async (req, res) => {
      const id = req.params.id;
      // const filtur = {  postId : }
      const query = { _id: new ObjectId(id) };
      const beVolunteer = await beVolunteersCollection.findOne(query);
      const volunteerFilter = { _id: new ObjectId(beVolunteer.postId) };

      const updateQuantity = { $inc: { volunteersNeeded: 1 } }
      await volunteersCollection.updateOne(volunteerFilter, updateQuantity)
      const result = await beVolunteersCollection.deleteOne(query);
      res.send(result);

    })

    // volunteer related api
    app.get('/volunteer', async (req, res) => {
      const search = req.query.search;
      // console.log(search)
      let query = {}
      if (search) {
        query = {

          postTitle: { $regex: search, $options: 'i' }
        }
      }

      const result = await volunteersCollection.find(query).sort({ deadline: 1 }).toArray();
      res.send(result);
    })

    app.get('/volunteer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteersCollection.findOne(query);
      res.send(result);
    })

    app.post('/volunteer', async (req, res) => {
      const volunteer = req.body;
      const result = await volunteersCollection.insertOne(volunteer);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from volunteer-management server ....')
})
app.listen(port, () => console.log(`server running on port : ${port}`))