const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const User = mongoose.model("User", {
  name: String,
  userId: String,
  email: String,
  password: String,
  country: String,
  city: String,
  phone: String,
});

const Postal = mongoose.model("Postal", {
  postId: String,
  title: String,
  userId: String,
  postData: {
    date: String,
    locationInfo: {
      city: String,
      state: String
    },
    description: String,
    author: String,
    image: String,
    userName: String,
    bidAmount: Number,
    biddingCompleted: { type: Boolean, default: false },
    lastBiddedUser: String
  }
});

const bidTransaction = mongoose.model("bidTransaction", {
  postId: String,
  userId: String,
  bidAmount: Number
});

const app = express();
const PORT = 5000;

// Fix for Mongoose strictQuery deprecation warning
mongoose.set("strictQuery", false);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://Sushanth:Sushanth@logininfo.djkc3gl.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    // random userId and hash the password
    const userId = Math.random().toString(36).substring(7);
    // hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // password = hashedPassword;
    const newUser = new User({ name, userId, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User signed up successfully", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed, please try again" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // Check if the password matches
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed, please try again" });
  }
});


app.post('/post-postal', async (req, res) => {
  const { title, date, city, state, description, author, userId, image, bidAmount } = req.body;
  console.log(req.body);
  // Save to your database here
  // Example MongoDB save (assuming you have a Postal model)
  const user = await User.findOne({userId: userId});
  const newPostal = new Postal({
    postId: Math.random().toString(36).substring(7),
    title,
    userId,
    postData: {
      date,
      locationInfo: {
        city,
        state
      },
      description,
      author,
      image,
      userName: user.name,
      bidAmount,
      lastBiddedUser: user.name
    }
  });

  const newBid = new bidTransaction({ postId: newPostal.postId, userId, bidAmount });
  newBid.save()
    .then(() => console.log('Bid placed successfully'))
    .catch((error) => console.error('Failed to place bid'));

  console.log(newPostal);

  newPostal.save()
    .then(() => res.status(200).json({ message: 'Postal stamp posted successfully' }))
    .catch((error) => res.status(500).json({ error: 'Failed to post postal stamp' }));
});

// url: http://localhost:5000/posts/${user.userId}`
app.get('/posts/:userId', (req, res) => {
  const { userId } = req.params;
  // Fetch posts from your database here
  // Example MongoDB fetch (assuming you have a Postal model)
  
  Postal.find({ userId })
    .then((posts) => posts.reverse())
    .then((posts) => res.status(200).json(posts))
    .catch((error) => res.status(500).json({ error: 'Failed to fetch posts' }));
});

// get all posts from the database expect the current user
app.get('/all-posts/:userId', (req, res) => {
  const { userId } = req.params;
  // Fetch posts from your database here
  // Example MongoDB fetch (assuming you have a Postal model)
  // also add the username of the user who posted the post using the userId and user model
  // also add the bidAmount of the post using the postId and bidTransaction model

  // Postal.find({ userId: { $ne: userId } })
  //   .then((posts) => posts.reverse())
  //   .then((posts) => res.status(200).json(posts))
  //   .catch((error) => res.status(500).json({ error: 'Failed to fetch posts' }));

  async function fetchAndFormatPosts(userId) {
    try {
      const posts = await Postal.find({ userId: { $ne: userId}, 'postData.biddingCompleted': false });
      // posts.filter(post => !post.postData.biddingCompleted);
      // console.log(posts);
      const formattedPosts = await Promise.all(
        posts.map(async (post) => {
          const bidsByUserOnPost = await bidTransaction.find({ postId: post.postId, userId });
          const allBidsOnPost = await bidTransaction.find({ postId: post.postId });
          return {
            postId: post.postId,
            title: post.title,
            userId: post.userId,
            postData: post.postData,
            bidData: {
              userBid: bidsByUserOnPost.length > 0 ? bidsByUserOnPost[bidsByUserOnPost.length - 1].bidAmount : null,
            },
          };
        })
      );
      return res.status(200).json(formattedPosts.reverse());
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }
  fetchAndFormatPosts(userId);
});

app.post('/place-bid', async (req, res) => {
  const { postId, bidAmount, userId } = req.body;
  // Save to your database here
  // Example MongoDB save (assuming you have a Postal model)
  const post = await Postal
    .findOne({ postId })
    .catch((error) => res.status(500).json({ error: 'Failed to place bid' }));
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  const user = await User.findOne({ userId });
  const newBid = new bidTransaction({ postId, userId, bidAmount });
  newBid.save()
    .then(() => {
      post.postData.bidAmount = bidAmount;
      post.postData.lastBiddedUser = user.name;
      post.save()
        .then(() => res.status(200).json({ message: 'Bid placed successfully' }))
        .catch((error) => res.status(500).json({ error: 'Failed to place bid' }));
    })
    .catch((error) => res.status(500).json({ error: 'Failed to place bid' }));
});

// Complete bidding route
app.post('/complete-bidding', async (req, res) => {
  const { postId } = req.body;
  console.log(req.body);
  // Update the bidding status in your database here
  // Example MongoDB update (assuming you have a Postal model)
  Postal.updateOne({ postId }, { 'postData.biddingCompleted': true })
    .then(() => res.status(200).json({ message: 'Bidding completed successfully' }))
    .catch((error) => res.status(500).json({ error: 'Failed to complete bidding' }));
});

app.get('/bidPosts/:userId', async (req, res) => {
  const { userId } = req.params;
  // Fetch posts from your database here
  // Example MongoDB fetch (assuming you have a Postal model)
  // also add the username of the user who posted the post using the userId and user model
  // also add the bidAmount of the post using the postId and bidTransaction model

  const bidPostsByUsers = await bidTransaction.find({ userId });
  // find the unique postIds
  const postIds = [...new Set(bidPostsByUsers.map((bid) => bid.postId))];
  console.log(postIds);
  const posts = await Postal.find({ postId: { $in: postIds } });
  // console.log(posts);
  const formattedPosts = await Promise.all(
    posts.map(async (post) => {
      const bidsByUserOnPost = await bidTransaction.find({ postId: post.postId, userId });
      const allBidsOnPost = await bidTransaction.find({ postId: post.postId });
      return {
        postId: post.postId,
        title: post.title,
        userId: post.userId,
        postData: post.postData,
        bidData: {
          userBid: bidsByUserOnPost.length > 0 ? bidsByUserOnPost[bidsByUserOnPost.length - 1].bidAmount : null,
          allBids: allBidsOnPost,
        },
      };
    })
  );
  res.status(200).json(formattedPosts.reverse());
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
