//jshint esversion:6
const express = require("express");
const app = express();
const path = require("path")
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const multer = require('multer');

var fs = require('fs');

const Products = require('./models/product.model');
const Register = require('./models/register.model');
const Cart = require('./models/cart.model')

// global variables for user
var isLogin = 0;
var loginDetails = {
  id: "NULL",
  name: "NULL",
  email: "NULL",
  password: "NULL",
  phone: "NULL",
  city: "NULL",
  address: "NULL"
}

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
app.use(express.static('uploads'));

mongoose.connection.once('open', function() {
  console.log('Database connection has been made');
}).on('error', function(error) {
  console.log('error is:', error);
})

//Schema for uploading image
userSchema = new mongoose.Schema ({
  seller_id: String,
  product_name: String,
  product_description: String,
  image: String
});

userModel = mongoose.model ('user', userSchema);

var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: function (req, file, callback){
      callback(null, file.filename + '-' + Date.now() + path.extname(file.originalname))
    }
  })
})

// Image dealing opsts and gets
app.post('/sell', upload.single('image'), (req, res)=>{
  console.log(req.file);
  var x = new userModel();
  x.seller_id = loginDetails.id;
  x.product_name = req.body.product_name;
  x.product_description = req.body.product_description;
  x.image = req.file.filename;
  x.save((err, doc)=>{
    if(!err){
      console.log("Saved Successfully");
      res.redirect('/users');
    }
    else{
      console.log(err);
    }
  })
})

app.get('/users', (req, res)=>{
  var userId = loginDetails.id;
  userModel.find().then(function(doc){
    res.render('user', {
      item: doc,
      userId: userId
    })
  })
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

app.get("/sell", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/sell.html'));
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
  loginDetails = {
    id: "NULL",
    name: "NULL",
    email: "NULL",
    password: "NULL",
    phone: "NULL",
    city: "NULL",
    address: "NULL"
  }
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
      // isLogin = 1;
      loginDetails.id = doc.id;
      loginDetails.name = doc.name;
      loginDetails.email = doc.email;
      loginDetails.password = doc.password;
      loginDetails.phone = doc.phone;
      loginDetails.address = doc.address;
      // res.redirect('/products');
      res.redirect('/seller');
    }
  })
})

app.get("/cart", function(req, res) {
  var userId = loginDetails.id;

  Products.find({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {

      // res.send(JSON.stringify(result));
      // console.log(JSON.stringify(result));

      console.log(userId);
      console.log(result);

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
