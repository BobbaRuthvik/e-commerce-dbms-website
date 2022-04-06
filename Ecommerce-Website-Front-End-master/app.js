//jshint esversion:6
const express = require("express");
const app = express();
const path = require("path")
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const mysql = require('mysql')

var fs = require('fs');

const Products = require('./models/product.model');
const Register = require('./models/register.model');
const Cart = require('./models/cart.model')

// global variables for user
var isLogin = 0;
//TODO: Use isLogin variable

// app.use(bodyParser.urlencoded({
//   extended: true
// }));

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

// Set EJS as templating engine
app.set("view engine", "ejs");

// connect with mysql
var mysqlConnection = mysql.createConnection({
  host: "br3q3frbqca53938jvl2-mysql.services.clever-cloud.com",
  user: "udtc3v1boae5qogq",
  password: "J1DYLKRrGzGy0mcZ9JDR",
  database: "br3q3frbqca53938jvl2",
  multipleStatements: true
});

mysqlConnection.connect((err) => {
  if (!err) {
    console.log("Connected to mySQL");
  } else {
    console.log(err);
  }
})

//connect with mongodb
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

// Create DB
app.get('/createdb', (req, res) => {
  let sql = 'CREATE DATABASE balance';
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Database created...');
  });
});

// Create table
app.get('/createbalancetable', (req, res) => {
  let sql = 'CREATE TABLE user(id VARCHAR(255), username VARCHAR(255), balance int, PRIMARY KEY (id))';
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Database created...');
  });
});

// Insert an user
app.get('/adduser', (req, res) => {
  let data = {
    id: "ghp_1",
    username: "Bobba Ruthvik",
    balance: 100
  };
  data.username = "Kishor";
  console.log(data);
  let sql = 'INSERT INTO user SET ?';
  mysqlConnection.query(sql, data, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('User added...');
  });
});

// Select single user using username(can use id later)
app.get('/selectuser/:username', (req, res) => {
  let sql = `SELECT * FROM user WHERE username = "${req.params.username}"`;
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

// Update user balance
app.get('/updateuser/:username', (req, res) => {
  let newBalance = 50;
  let sql = `UPDATE user SET balance = ${newBalance} WHERE username = "${req.params.username}"`;
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

// Delete user
app.get('/deleteuser/:username', (req, res) => {
  let newBalance = 50;
  let sql = `DELETE FROM user WHERE username = "${req.params.username}"`;
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.get("/", function(req, res) {
  isLogin = 0;
  res.sendFile(path.join(__dirname, 'views/index.html'));
})

app.get("/seller", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/seller.html'));
})

app.get("/products", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/products.html'));
})

app.get("/signup", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/signup.html'));
})

app.post("/signup", async (req, res) => {
  try {

    // console.log(req.body.name);
    // res.send(req.body.name);

    const registerUser = new Register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      city: req.body.city,
      address: req.body.address
    })

    const registered = await registerUser.save();
    console.log(registerUser);
    res.send(registerUser);
    // res.status(201).render("views/index.html");
  } catch (error) {
    res.status(400).send(error);
  }
})

app.get("/login", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/login.html'));
})

app.post("/signup", async (req, res) => {
  try {

    const registered = await registerUser.save();
    console.log(registerUser);
    res.send(registerUser);
    // res.status(201).render("views/index.html");
  } catch (error) {
    res.status(400).send(error);
  }
})


app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  console.log(email, password);

  Register.findOne({
    email
  }, (err, doc) => {
    if (err) {
      console.log(err);
    } else if (!doc) {
      console.log('User details unavailable');
      res.redirect('/signup');
    } else {
      isLogin = 1;
      res.redirect('/products');
    }
  })
})

app.get("/cart", function(req, res) {
  var userId = "1";

  Cart.find({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {

      // res.send(JSON.stringify(result));
      console.log(JSON.stringify(result));

      res.render('dummy_cart', {
        userId: userId,
        practices: result
      })
    }
  })
});

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
