require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


// NQYmhQQ3wGfg73oC  - mongoDB password
// Bliss_Bond - mongoDB username



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fqi16.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

   async function run() {
  try {

    const userCollection = client.db("BlissBond").collection("users");
    const Create_Edit_Biodata_Collection = client.db("BlissBond").collection("Create_Edit_Biodata");
    const successStoryCollection = client.db("BlissBond").collection("SuccessStories");
    



    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
          return res.status(401).send({ message: 'Unauthorized request - No token provided' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
              return res.status(401).send({ message: 'Unauthorized request - Invalid token' });
          }
          req.decoded = decoded;
          next();
      });
  };
    // const verifyToken = (req, res, next) => {
    //   console.log("Headers received:", req.headers.authorization);

    //   if (!req.headers.authorization) {
    //     console.log("Authorization header missing");
    //     return res.status(401).send({ message: 'Unauthorized request - No token provided' });
    //   }

    //   const token = req.headers.authorization.split(' ')[1];
    //   console.log("Token received:", token);

    //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     if (err) {
    //       console.log("Token verification error:", err.message);
    //       return res.status(401).send({ message: 'Unauthorized request - Token invalid' });
    //     }

    //     console.log("Token decoded:", decoded);
    //     req.decoded = decoded;
    //     next();
    //   });
    // };

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'Forbidden Access' });
      }
      next();

    }


    // Login-Rerister user -> 
    // app.post('/users', verifyToken,async (req, res) => {
    //   const User = req.body;
    //   const query = { email: User.email };
    //   const existingUser = await userCollection.findOne(query);
    //   if (existingUser) {
    //     return res.send({ status: 'error', message: 'User already exists', insertedId: null });
    //   }

    //   console.log('adding new user: ', User);
    //   const result = await userCollection.insertOne(User);
    //   console.log('got result', result);
    //   res.send(result);
    // });

    // Allow user registration without verifyToken
// REMOVE `verifyToken` FROM THIS ROUTE
app.post('/users', async (req, res) => { 
  const User = req.body;
  const query = { email: User.email };
  const existingUser = await userCollection.findOne(query);

  if (existingUser) {
      return res.send({ status: 'error', message: 'User already exists', insertedId: null });
  }

  console.log('Adding new user:', User);
  const result = await userCollection.insertOne(User);
  console.log('User added:', result);
  res.send(result);
});



    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })




    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result)
    })

    app.get('/users/admin/:email',  async (req, res) => {
      const email = req.params.email;
      
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.post('/jwt', async (req, res) => {
      const user = req.body; // { email: "user@example.com" }
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
  });

    // Create/Edit user ->
    // app.post('/create-edit-biodata', async (req, res) => {
    //   const CE_Biodata = req.body;
    //   const result = await Create_Edit_Biodata_Collection.insertOne(CE_Biodata);
    //   console.log(result);
    //   res.send(result);
    // });
    // Create/Edit user ->
    app.post('/create-edit-biodata', async (req, res) => {
      try {
        const CE_Biodata = req.body;
        const lastBiodata = await Create_Edit_Biodata_Collection.findOne(
          {},
          { sort: { biodataId: -1 } } // Sort by biodataId in descending order
        );
        // Generate new biodataId
        const newBiodataId = lastBiodata ? lastBiodata.biodataId + 1 : 1;
        // Add the generated biodataId to the biodata object
        CE_Biodata.biodataId = newBiodataId;
        // Insert the biodata into the database
        const result = await Create_Edit_Biodata_Collection.insertOne(CE_Biodata);
        console.log('Biodata created:', result);
        // Send success response
        res.status(201).send({ message: 'Biodata created successfully', biodataId: newBiodataId });
      } catch (error) {
        console.error('Error creating biodata:', error);
        res.status(500).send({ message: 'Failed to create biodata', error });
      }
    });

    app.get('/get-create-edit-biodata', async (req, res) => {
      try {
        const biodataList = await Create_Edit_Biodata_Collection.find().toArray(); // Fetch all biodata
        res.status(200).send(biodataList);
      } catch (error) {
        console.error('Error fetching biodata:', error);
        res.status(500).send({ message: 'Failed to fetch biodata', error });
      }
    });

    app.post('/request-premium', async (req, res) => {
      try {
        const { name, email } = req.body;
        const premiumRequest = { name, email, status: 'Pending', requestedAt: new Date() };
    
        const result = await client.db("BlissBond").collection("PremiumRequests").insertOne(premiumRequest); // [PremiumRequests collection DB]
        res.status(201).send({ message: 'Premium request submitted successfully', result });
      } catch (error) {
        console.error('Error submitting premium request:', error);
        res.status(500).send({ message: 'Failed to submit premium request', error });
      }
    });
    
    // Get all premium requests
    app.get('/premium-requests', async (req, res) => {
      try {
        const premiumRequests = await client.db("BlissBond").collection("PremiumRequests").find().toArray();
        res.status(200).send(premiumRequests);
      } catch (error) {
        console.error('Error fetching premium requests:', error);
        res.status(500).send({ message: 'Failed to fetch premium requests', error });
      }
    });
    
    // Approve a premium request
    app.patch('/approve-premium/:id',  async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: { status: 'Approved' } };
    
        const result = await client.db("BlissBond").collection("PremiumRequests").updateOne(filter, updateDoc);
        res.status(200).send({ message: 'Premium request approved successfully', result });
      } catch (error) {
        console.error('Error approving premium request:', error);
        res.status(500).send({ message: 'Failed to approve premium request', error });
      }
    });

    app.patch('/update-biodata-premium/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = { $set: { isPremium: true } };
    
        const result = await Create_Edit_Biodata_Collection.updateOne(filter, updateDoc);
        res.status(200).send({ message: "User marked as premium successfully", result });
      } catch (error) {
        console.error("Error updating biodata to premium:", error);
        res.status(500).send({ message: "Failed to mark user as premium", error });
      }
    });

    app.get('/get-create-edit-biodata/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const biodata = await Create_Edit_Biodata_Collection.findOne({ email });
        res.status(200).send(biodata);
      } catch (error) {
        console.error("Error fetching biodata:", error);
        res.status(500).send({ message: "Failed to fetch biodata", error });
      }
    });


    app.patch('/update-biodata/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const updateData = req.body;
        const result = await Create_Edit_Biodata_Collection.updateOne(
          { email: email },
          { $set: updateData }
        );
        res.status(200).send({ message: "Biodata updated successfully", result });
      } catch (error) {
        console.error("Error updating biodata:", error);
        res.status(500).send({ message: "Failed to update biodata", error });
      }
    });



app.get('/premium-requests', async (req, res) => {
  try {
    const premiumRequests = await client.db("BlissBond").collection("PremiumRequests").find().toArray();
    res.status(200).send(premiumRequests);
  } catch (error) {
    console.error('Error fetching premium requests:', error);
    res.status(500).send({ message: 'Failed to fetch premium requests', error });
  }
});


app.patch('/update-biodata-premium/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const filter = { email: email };
    const updateDoc = { $set: { isPremium: true } };

    const result = await Create_Edit_Biodata_Collection.updateOne(filter, updateDoc);

    // Also update the request status in PremiumRequests
    await client.db("BlissBond").collection("PremiumRequests").updateOne(
      { email: email },
      { $set: { status: "Approved" } }
    );

    res.status(200).send({ message: "User marked as premium successfully", result });
  } catch (error) {
    console.error("Error updating biodata to premium:", error);
    res.status(500).send({ message: "Failed to mark user as premium", error });
  }
});




app.get('/biodata-details/:biodataId', async (req, res) => {
  try {
    const biodataId = parseInt(req.params.biodataId); // Ensure it's an integer
    console.log("Fetching biodata for ID:", biodataId);
    
    const biodata = await Create_Edit_Biodata_Collection.findOne({ biodataId });

    if (!biodata) {
      return res.status(404).send({ message: "Biodata not found" });
    }

    res.status(200).send(biodata);
  } catch (error) {
    console.error("Error fetching biodata:", error);
    res.status(500).send({ message: "Failed to fetch biodata", error });
  }
});





app.post('/add-to-favourite', async (req, res) => {
  try {
    const { biodataId, name, permanentDivision, occupation } = req.body;

    // Check if already in favourites
    const existing = await client.db("BlissBond").collection("FavouriteBiodatas").findOne({ biodataId });
    if (existing) {
      return res.status(400).send({ message: "Already added to favourites!" });
    }

    const favouriteBiodata = { biodataId, name, permanentDivision, occupation };
    const result = await client.db("BlissBond").collection("FavouriteBiodatas").insertOne(favouriteBiodata);
    res.status(201).send({ message: "Added to Favourites!", result });
  } catch (error) {
    console.error("Error adding to favourite:", error);
    res.status(500).send({ message: "Failed to add to favourite", error });
  }
});

app.get('/favourite-biodatas', async (req, res) => {
  try {
      const favourites = await client.db("BlissBond").collection("FavouriteBiodatas").find().toArray();
      res.status(200).send(favourites); // Ensure response is an array
  } catch (error) {
      console.error("Error fetching favourite biodatas:", error);
      res.status(500).send([]); // Return an empty array on failure
  }
});

app.delete('/remove-favourite/:biodataId', async (req, res) => {
  try {
    const biodataId = parseInt(req.params.biodataId);
    const result = await client.db("BlissBond").collection("FavouriteBiodatas").deleteOne({ biodataId });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Biodata not found in favourites!" });
    }

    res.status(200).send({ message: "Removed from Favourites!" });
  } catch (error) {
    console.error("Error removing favourite:", error);
    res.status(500).send({ message: "Failed to remove favourite", error });
  }
});




app.post('/store-payment', async (req, res) => {
  const paymentData = req.body;
  const result = await client.db("BlissBond").collection("ContactRequests").insertOne(paymentData);
  res.send(result);
});

app.get('/get-payment-requests', async (req, res) => {
  const result = await client.db("BlissBond").collection("ContactRequests").find({ status: "Pending" }).toArray();
  res.send(result);
});




app.get('/get-my-contact-requests', async (req, res) => {
  const result = await client.db("BlissBond").collection("ContactRequests").find().toArray();
  res.send(result);
});


app.patch('/approve-payment/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { status: "Approved" } };

    // Update ContactRequests collection
    const result = await client.db("BlissBond").collection("ContactRequests").updateOne(filter, updateDoc);

    // Get user email to update biodata
    const approvedRequest = await client.db("BlissBond").collection("ContactRequests").findOne(filter);
    
    if (approvedRequest) {
      await client.db("BlissBond").collection("Create_Edit_Biodata").updateOne(
        { email: approvedRequest.email },
        { $set: { isPremium: true } }
      );
    }

    res.status(200).send({ message: "Approved successfully", result });
  } catch (error) {
    console.error("Approval failed:", error);
    res.status(500).send({ message: "Approval failed", error });
  }
});


  //-------------------Success Stories-------------------


// API to store success story
app.post("/success-stories", async (req, res) => {
  try {
    const newStory = req.body;
    const result = await successStoryCollection.insertOne(newStory);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error adding success story:", error);
    res.status(500).send({ message: "Failed to add success story", error });
  }
});

// API to get all success stories
app.get("/success-stories", async (req, res) => {
  try {
    const stories = await successStoryCollection.find().toArray();
    if (!stories || stories.length === 0) {
      return res.status(404).send({ message: "No success stories found" });
    }
    res.status(200).send(stories);
  } catch (error) {
    console.error("Error fetching success stories:", error);
    res.status(500).send({ message: "Failed to fetch success stories", error });
  }
});




// -------------------User Success Stories-------------------
app.post("/user-stories", async (req, res) => {
  try {
    const newStory = req.body;
    const result = await client.db("BlissBond").collection("userStories").insertOne(newStory);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error adding user story:", error);
    res.status(500).send({ message: "Failed to add user story", error });
  }
});

// API to get all success stories
app.get("/user-stories", async (req, res) => {
  try {
    const stories = await client.db("BlissBond").collection("userStories").find().toArray();
    if (!stories || stories.length === 0) {
      return res.status(404).send({ message: "No success stories found" });
    }
    res.status(200).send(stories);
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).send({ message: "Failed to fetch user stories", error });
  }
});




// // Payment Intent
// app.post('/create-payment-intent', async (req, res) => {
  
//    const {price} = req.body;
//    const amount = parseInt(price) * 100;
//    const paymentIntent = await stripe.paymentIntents.create({
//      amount: amount,
//      currency: 'usd',
//      payment_method_types: ['card'],
//    });


//    res.send({
//      clientSecret: paymentIntent.client_secret
//    });
// });




// // --

// app.get('/cards', async (req, res) => {
//   const result = await cardCollection.find().toArray();
//   res.send(result);
// });

// app.post('/cards', async (req, res) => {
//   const cardItem = req.body;
//   const result = await cardCollection.insertOne(cardItem);
//   res.send(result);
// });






    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World Bliss Bond website is running!');
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});