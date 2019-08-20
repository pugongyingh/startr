// Require the .env file (this will contain secret information)
require('dotenv').config();

// Require packages
const express = require("express");
const ejs = require("ejs");

// Set up express
const app = express(); // Create the express application -> named 'app'
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Allows parsing of requests (POST) - based off body-parser
app.use(express.static("public")); // Serve static files from the 'public' directory

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
    res.render("jobs");
})

// Set up port
// Run the server on port 3000, unless it is deployed (Heroku sets process.env.PORT)
const port = process.env.PORT || 3000;
// Server will listen on the specified port and will log a message when this occurs
app.listen(port, function () {
  console.log("Port is running on " + port);
});