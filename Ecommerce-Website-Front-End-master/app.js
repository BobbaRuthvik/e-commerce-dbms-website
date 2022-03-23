//jshint esversion:6
const express = require("express");
const app = express();
const path = require("path")
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

var fs = require('fs');

const Products = require('./models/product.model')

// app.use(bodyParser.urlencoded({
//   extended: true
// }));

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

// Set EJS as templating engine
app.set("view engine", "ejs");

//connect with db
mongoose.connect('mongodb+srv://dbmsKali:2455bobba@dbmskali.biyrt.mongodb.net/E-commerce', {
  useNewUrlParser: true
});

// making path global(server-wise)
app.use('*/css', express.static('public/css'));
app.use('*/js', express.static('public/js'));
app.use('*/images', express.static('public/images'));

mongoose.connection.once('open', function() {
  console.log('Database connection has been made');
}).on('error', function(error) {
  console.log('error is:', error);
})

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
})

app.get("/products", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/products.html'));
})

app.get("/check", function(req, res) {

  // Products.findOne({
  //   "name": {
  //     $regex: /R/,
  //     $options: "i"
  //   }
  // }, function(err, docs) {
  //   console.log("Partial Search Begins");
  //   console.log(docs.name);
  // });

  // res.send('hi');

  // });
})

app.post("/search_results", function(req, res) {
  console.log(req.body.searchText);
  var searchString = req.body.searchText;

  Products.find({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {

      // res.send(JSON.stringify(result));
      console.log(JSON.stringify(result));

      res.render('searchResult', {
        searchString: searchString,
        practices: result
      })
    }
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
})
