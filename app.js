//jshint esversion:6

// Require the .env file (this will contain secret information - TBC)
require('dotenv').config();

// Require packages
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");

// Set up express
const app = express(); // Create the express application -> named 'app'
app.set('view engine', 'ejs');

//Avoid Mongoose deprecation warnings
app.set('useFindAndModify', false);

app.use(express.urlencoded({
  extended: true
})); // Allows parsing of requests (POST)
app.use(express.static("public")); // Serve static files from the 'public' directory

//Connect to MongoDB database (db is created here)
mongoose.connect("mongodb:localhost:27017/interviewsDB", {
  useNewUrlParser: true
});

//Create a new schema
const interviewSchema = {
  video: String,
  title: String,
  blurb: String,
  content: String,
  soundCloud: String
};

//Create a new mongoose model based on the schema
const Interview = mongoose.model("Interview", interviewSchema);

// Set up routes

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/jobs", function(req, res) {
  //Find ALL videos (documents) in database


  res.render("jobs");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/signup", function(req, res) {
  res.render("signup");
});

app.get("/success", function(req, res) {
  res.render("success");
});

app.get("/failure", function(req, res) {
  res.render("failure");
});

//Set up post request for when user inputs their details
app.post("/signup", function(req, res) {

  //Parse values from form
  firstName = req.body.firstName;
  lastName = req.body.lastName;
  email = req.body.email;
  // age = req.body.age;
  //region they are from

  //Put values into one variable called userInformation
  console.log(firstName, lastName, email);

  var userInformation = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
      //age and region
    }]
  };

  //Save into a new variable that converts the userInformation into a JSON object
  var jsonData = JSON.stringify(userInformation);

  var options = {
    url: "https://us4.api.mailchimp.com/3.0/lists/8776ede861",
    method: "POST",
    headers: {
      "Authorization": "aefreeman API KEY GOES HERE" //--> remember to change end to the server allocated
    },
    body: jsonData

  };


  //Render success or failure template

  request(options, function(error, response, body) {

    if (error) {
      res.redirect("/failure");
    } else if (response.statusCode != 200) {

      res.redirect("/failure");
    } else {
      res.redirect("/success");
    }

  });

  //Go to login page after success page
  app.post("/success", function(req, res) {
    res.redirect("/login");
  });

  //Return to sign up page from failure page when button clicked using a post request

  app.post("/failure", function(req, res) {
    res.redirect("/signup");
  });

});




// Set up port
// Run the server on port 3000, unless it is deployed (Heroku sets process.env.PORT)
const port = process.env.PORT || 3000;
// Server will listen on the specified port and will log a message when this occurs
app.listen(port, function() {
  console.log("Port is running on " + port);
});
