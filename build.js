// jshint esversion: 6
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

function ejs2html({ path, outPath, data, options }) {
  fs.readFile(path, "utf8", function(err, data) {
    if (err) {
      console.log(err);
      return false;
    }
    ejs.renderFile(path, data, options, (err, html) => {
      if (err) {
        console.log(err);
        return false;
      }
      fs.writeFile(outPath, html, function(err) {
        if (err) {
          console.log(err);
          return false;
        }
        return true;
      });
    });
  });
}

ejs2html({
  path: `${__dirname}/views/home.ejs`,
  outPath: `${__dirname}/public/index.html`,
});

ejs2html({
  path: `${__dirname}/views/about.ejs`,
  outPath: `${__dirname}/public/about.html`,
});
