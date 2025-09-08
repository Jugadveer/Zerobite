const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
const app=express();
const methodOverride = require('method-override');
const session = require('express-session');
const User = require('./models/User');
const Donation = require('./models/Donation');
const donationRoutes = require('./routes/donationRoutes');
const Analytics = require('./models/Analytics');

const MongoStore = require('connect-mongo');
const { updateUserAnalytics } = require('./utils/updateAnalytics');

app.set("views",path.join(__dirname,"/views"));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
// app.use(session({
//   secret: 'zerobite',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { maxAge: 24 * 60 * 60 * 1000 }
// }));
app.use(donationRoutes);


app.use(session({
  secret: 'zerobite',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://127.0.0.1:27017/zerobite',  // your existing DB
    collectionName: 'sessions'   // specify collection name for sessions
  }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
main()

.then(() => { console.log("Connected to MongoDB");
})



.catch(err => console.log(err));



async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/zerobite');

  
}













app.get("/",(req,res)=>{
    res.redirect("/zerobite");
})

app.get('/zerobite', (req, res) => {
  res.render('index.ejs', { user: req.session.user || null });
});

app.post('/zerobite/logout', (req, res) => {

    console.log("Logging out user:", req.session.user);
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Could not log out.");
    }
    res.redirect('/zerobite');
  });
});


app.post("/zerobite/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user with same email exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).send("User with this email already exists");
    }

    // Create and save new user
    const user = new User({ name, email, password });
    await user.save();

    console.log("User created:", email);
    res.redirect("/zerobite");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Internal server error");
  }
});

app.post('/zerobite/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password }); // simple matching as per your no-hash requirement
  if (!user) {
    return res.status(401).send('Invalid email or password or account do not exists');
  }
  req.session.user = { id: user._id, name: user.name, email: user.email };
  res.redirect('/zerobite'); // redirect after login
});

    

app.get("/zerobite/donations", async (req, res) => {
  try {
    
    const donations = await Donation.find()
      .populate('donor') 
      .sort({ createdAt: -1 });

    res.render("donations.ejs", { user: req.session.user || null, donations });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).send("Server error");
  }
});


app.get("/zerobite/donate",(req,res)=>{
    res.render("donate.ejs",{ user: req.session.user || null });
})

app.get("/zerobite/rewards",(req,res)=>{
    res.render("rewards.ejs",{ user: req.session.user || null });
})


app.get("/zerobite/volunteer",(req,res)=>{
    res.render("volunteer.ejs",{ user: req.session.user || null });
})




app.get('/zerobite/analytics', async (req, res) => {
  if (!req.session?.user) {
    return res.redirect('/zerobite/login'); // or wherever your login is
  }

  try {
    await updateUserAnalytics(req.session.user.id);

    // Fetch updated analytics document for rendering
    const currentPeriod = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const analyticsData = await Analytics.findOne({ user: req.session.user.id, date: currentPeriod });
    
    res.render('analytics.ejs', { user: req.session.user, analytics: analyticsData });
  } catch (error) {
    console.error('Error updating analytics:', error);
    res.status(500).send('Error loading analytics');
  }
});



app.listen(8080,()=>{
    console.log("Server is running on port 8080");
})
