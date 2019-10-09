//jshint esversion:6

// Require the .env file (this will contain secret information - TBC)
require('dotenv').config();

// Require packages
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const GoogleStrategy = require('passport-google-oauth20').Strategy; //used as a passport strategy
// const findOrCreate = require("mongoose-findorcreate");
// const FacebookStrategy = require("passport-facebook").Strategy;

// Set up express
const app = express(); // Create the express application -> named 'app'
// app.set('view engine', 'ejs');



// app.use(express.urlencoded({
//   extended: true
// })); // Allows parsing of requests (POST)
// app.use(express.static("public")); // Serve static files from the 'public' directory

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));



app.use(session({
  secret: process.env.PASSPORT_SECRET, //transfer to .env file
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); //use passport to deal with the sessions (set up before)


//Connect to MongoDB database (db is created here)
mongoose.connect("mongodb://localhost:27017/startrDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Avoid Mongoose deprecation warnings
app.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

///////////////////////INTERVIEW COLLECTION//////////////////////////
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

///////////////////////BLOG POSTS COLLECTION//////////////////////////

///////////////////////USER LOGINS COLLECTION//////////////////////////
//Create a new schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

//Use passport plugins
userSchema.plugin(passportLocalMongoose);

//Create a new mongoose model based on the schema
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

///////////////////////SET UP ROUTES//////////////////////////
app.get("/", function(req, res) {
  Interview.countDocuments({}, function(err, count){
    console.log(count);
    const totalDocuments = count;
    const randomNumber = Math.random;
    const indexOfRandomVideo = Math.floor(randomNumber * totalDocuments);

    Interview.findOne().skip(indexOfRandomVideo).exec(
    function (err, result) {
      console.log(result); //this is working
  });
  });
  res.render("home"
  // , {video: result.video}
); //can't find result
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/jobs", function(req, res) {
  Interview.find({}, function(err, foundInterviews) {
    if (!err) {
      res.render("jobs", {
        interviews: foundInterviews
      });
    } else {
      console.log(err);
    }
  });
});

//Route to display single interview
app.get("/interviews/:interviewID", function(req, res) {
  const requestedInterviewID = req.params.interviewID;

  Interview.findOne({
    _id: requestedInterviewID
  }, function(err, interview) {

    if (err) {
      console.log(err);
    } else {
      res.render("oneInterview", {
        video: interview.video,
        title: interview.title,
        content: interview.content,
        soundCloud: interview.soundCloud
      });
    }
  });
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

app.get("/edit", function(req, res) {
  //authenticate user: only if they have admin login
  res.render("edit");
});

app.get("/dashboard", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("dashboard");
  } else {
    res.redirect("/login");
  }

});

//Set up post request for home page to generate random video
app.post("/", function(req, res){
  // Find the number of videos in database

  // Math.random up to this value
  // Find the video in the database which matches this number
});

//Set up post request for when user inputs their details
app.post("/signup", function(req, res) {

  //Parse values from form
  firstName = req.body.firstName;
  lastName = req.body.lastName;
  email = req.body.username;
  password = req.body.password;
  // age = req.body.age;
  //region they are from


  //////////Send user information to mailchimp//////////////

  // Put values into one variable called userInformation
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

  // Save into a new variable that converts the userInformation into a JSON object
  var jsonData = JSON.stringify(userInformation);
  const mailChimpAPIKey = process.env.MAILCHIMP_API_KEY;
  var options = {
    url: "https://us4.api.mailchimp.com/3.0/lists/8776ede861",
    method: "POST",
    headers: {
      "Authorization": "aefreeman mailChimpAPIKey" //--> remember to change end to the server allocated
    },
    body: jsonData

  };

  // Render success or failure template

  // request(options, function(error, response, body) {
  //
  //   if (error) {
  //     res.redirect("/failure");
  //   } else if (response.statusCode != 200) {
  //
  //     res.redirect("/failure");
  //   } else {
  //     res.redirect("/success");
  //   }
  //
  // });

  /////////////Create user in database/////////////////////////
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/failure");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/success");
        console.log("Success");
      });
    }
  });
  console.log(res.statusCode);



  //Go to login page after success page
  app.post("/success", function(req, res) {
    res.redirect("/login");
  });

  //Return to sign up page from failure page when button clicked using a post request

  app.post("/failure", function(req, res) {
    res.redirect("/signup");
  });

});


app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/dashboard");
      });

    }
  });

});

//////////////// DB requests using edit page //////////////////

app.post("/edit", function(req, res) {

  const methodType = req.body.edit;
  console.log(methodType);


  if (methodType === "insert") {
    const newInterview = new Interview({
      video: req.body.video,
      title: req.body.title,
      blurb: req.body.blurb,
      content: req.body.longContent,
      soundCloud: req.body.soundCloud
    });

    newInterview.save(function(err) {
      if (!err) {
        res.redirect("/edit");
        console.log("Successfully created new entry in database");
      } else {
        console.log(err);
      }
    });

  } else if (methodType === "update") {
    Interview.updateOne({
        title: req.body.currentTitle
      }, {
        video: req.body.video,
        title: req.body.title,
        blurb: req.body.blurb,
        soundCloud: req.body.soundCloud,
        content: req.body.longContent
      },
      function(err) {
        if (!err) {
          res.redirect("/edit");
          console.log("Successfully updated database");
        } else {
          console.log(err);
        }
      });
  } else if (methodType === "delete") {

    Interview.deleteOne({
        title: req.body.currentTitle
      },
      function(err) {
        if (!err) {
          res.redirect("/edit");
          console.log("Successfully deleted item from database");
        } else {
          console.log(err);
        }
      }

    );


  } else {
    //Change this to an alert!
    console.log("Error with editing the interviews page");
  }
});



// Set up port
// Run the server on port 3000, unless it is deployed (Heroku sets process.env.PORT)
const port = process.env.PORT || 3000;
// Server will listen on the specified port and will log a message when this occurs
app.listen(port, function() {
  console.log("Port is running on " + port);
});
