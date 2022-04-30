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
var newUser = 0;
var isLogin = 0;
var flag = 0;
var loginDetails = {
  id: "NULL",
  name: "NULL",
  email: "NULL",
  password: "NULL",
  phone: "NULL",
  city: "NULL",
  address: "NULL",
  type: "NULL"
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
    // console.log(err);\
    console.log(err.code);
    console.log(err.fatal);
  }
})

setInterval(()=>{
  mysqlConnection.query("SELECT 1");
}, 5000)

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
userSchema = new mongoose.Schema({
  seller_id: String,
  product_name: String,
  product_description: String,
  product_price: Number, // check if it's number or int or anything else
  image: String
});

userModel = mongoose.model('user', userSchema);

var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: function(req, file, callback) {
      callback(null, file.filename + '-' + Date.now() + path.extname(file.originalname))
    }
  })
})

// Image dealing opsts and gets
app.post('/sell', upload.single('image'), (req, res) => {
  console.log(req.file);
  var x = new userModel();
  x.seller_id = loginDetails.id;
  x.product_name = req.body.product_name;
  x.product_description = req.body.product_description;
  x.product_price = req.body.product_price;
  x.image = req.file.filename;
  x.save((err, doc) => {
    if (!err) {
      console.log("Saved Successfully");
      res.redirect('/users');
    } else {
      console.log(err);
    }
  })
})

app.get('/users', (req, res) => {
  var userId = loginDetails.id;
  userModel.find().then(function(doc) {
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
app.get('/createtables', (req, res) => {
  // 624ecace19326b6e224c7b8b
  // 624d3d0f492d8613e39f9ebd

  let sql = 'CREATE TABLE seller (idseller VARCHAR(45) NOT NULL,s_balance INT NULL,PRIMARY KEY (idseller)); CREATE TABLE buyer (idbuyer VARCHAR(45) NOT NULL, b_balance INT NULL, PRIMARY KEY (idbuyer)); INSERT INTO buyer VALUES ("624ecace19326b6e224c7b8b", 5000); INSERT INTO seller VALUES ("624d3d0f492d8613e39f9ebd", 0); UPDATE buyer SET b_balance = buyer.b_balance - 1000 WHERE idbuyer = "624ecace19326b6e224c7b8b"; UPDATE seller SET s_balance = seller.s_balance + 1000 WHERE idseller = "624d3d0f492d8613e39f9ebd";';
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('seller table created...');
  });
});

// transaction
app.get('/transaction', (req, res) => {
  var userId = loginDetails.id;

  Cart.find({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {

      // res.send(JSON.stringify(result));
      // console.log(JSON.stringify(result));

      console.log(userId);
      console.log(result);
      var cartflag = true;
      result.forEach(function(singleResult){
        if(userId == singleResult.buyer_id){
          var currentPrice = singleResult.product_price;
          var currentSellerId = singleResult.seller_id;
          var productId = singleResult._id;

          let sql = `UPDATE buyer SET b_balance = buyer.b_balance - ${currentPrice} WHERE idbuyer = "${userId}"; UPDATE seller SET s_balance = seller.s_balance + ${currentPrice} WHERE idseller = "${currentSellerId}";`;
          mysqlConnection.query(sql, (err, result) => {
            if (err) throw err;
            console.log(result);
            // result.deleteOne({ "_id": productId });
            // result.deleteOne({ "_id": productId }, function(error1, result1){
            Cart.deleteOne({ "_id": productId }, function(error1, result1){
              if(error1){
                console.log(error1);
              }
              else{
                cartflag = false;
                // res.redirect('/success');
              }
            });
          });
        }
      })
      // if(cartflag===false)
        res.redirect('/success');
    }
  })
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

app.get("/wallet", function(req, res) {
  var userId = loginDetails.id;
  var balance = -1;
  // find balance here pass it to variablr balance
  // res.render('wallet');

  var userId = loginDetails.id;
  let newBalance = 50;
  let sql = `SELECT s_balance from seller where idseller = "${userId}";`;
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    result=JSON.stringify(result);
    console.log(result);
    // res.send(result);
    var total = "";
    var local_flag = 0;
    for(var i=0; i<result.length; i++){
      if (result[i] === ':') {
        local_flag = 1;
      }
      else if (result[i] === '}') {
        console.log("found");
        local_flag = 0;
      }
      else if(local_flag === 1){
        total += result[i];
      }
      // console.log(result[i]);
    }
    // res.send(total);
    // res.render('wallet');
    res.render('wallet', {
      total: total
    })
  });
})


app.get("/bwallet", function(req, res) {
  var userId = loginDetails.id;
  var balance = -1;
  // find balance here pass it to variablr balance
  // res.render('wallet');

  var userId = loginDetails.id;
  let newBalance = 50;
  let sql = `SELECT b_balance from buyer where idbuyer = "${userId}";`;
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    result=JSON.stringify(result);
    console.log(result);
    // res.send(result);
    var total = "";
    var local_flag = 0;
    for(var i=0; i<result.length; i++){
      if (result[i] === ':') {
        local_flag = 1;
      }
      else if (result[i] === '}') {
        console.log("found");
        local_flag = 0;
      }
      else if(local_flag === 1){
        total += result[i];
      }
      // console.log(result[i]);
    }
    // res.send(total);
    // res.render('wallet');
    res.render('bwallet', {
      total: total
    })
  });
})

app.get("/price", function(req, res) {
  var userId = loginDetails.id;
  let newBalance = 50;
  let sql = `SELECT b_balance from buyer where idbuyer = "624ecace19326b6e224c7b8b";`;
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    result=JSON.stringify(result);
    console.log(result);
    // res.send(result);
    var total = "";
    var local_flag = 0;
    for(var i=0; i<result.length; i++){
      if (result[i] === ':') {
        local_flag = 1;
      }
      else if (result[i] === '}') {
        console.log("found");
        local_flag = 0;
      }
      else if(local_flag === 1){
        total += result[i];
      }
      // console.log(result[i]);
    }
    res.send(total);
  });
})

app.get("/inventory", function(req, res) {
  var userId = loginDetails.id;
  userModel.find({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {

      // res.send(JSON.stringify(result));
      // console.log(JSON.stringify(result));

      // console.log(userId);
      console.log(result);

      res.render('inventory', {
        userId: userId,
        practices: result
      })
    }
  })
})

app.get("/success", function(req, res) {
  isLogin = 0;
  res.sendFile(path.join(__dirname, 'views/success.html'));
})

app.get("/track", function(req, res) {
  isLogin = 0;
  res.sendFile(path.join(__dirname, 'views/track.html'));
})

app.get("/progress", function(req, res) {
  isLogin = 0;
  res.sendFile(path.join(__dirname, 'views/progress.html'));
})

app.get("/seller", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/seller.html'));
})

app.get("/sell", function(req, res) {
  res.sendFile(path.join(__dirname, 'views/sell.html'));
})


app.post("/transaction", function(req, res) {
  // res.sendFile(path.join(__dirname, 'views/sell.html'));
  var buyer_id = loginDetails.id;
  Cart.findOne({
    buyer_id
  }, (err, doc) => {
    if (err) {
      console.log(err);
    } else if (!doc) {
      console.log('User details unavailable');
      res.redirect('/signup');
    } else {
      // // isLogin = 1;
      // loginDetails.id = doc.id;
      // loginDetails.name = doc.name;
      // loginDetails.email = doc.email;
      // loginDetails.password = doc.password;
      // loginDetails.phone = doc.phone;
      // loginDetails.address = doc.address;
      // res.redirect('/products');
      // // res.redirect('/seller');
      var seller_id = doc.seller_id;
      var item_price = doc.product_price;
      res.send(seller_id);
    }
  })
})

app.get("/settings", function(req, res) {
  flag = 0;
  res.render('settings', {
    flag: flag
  })
})

app.get("/logout", function(req, res) {
  res.redirect('/');
})

app.post("/settings", function(req, res) {
  let oldpassword = req.body.oldpassword;
  let newpassword = req.body.newpassword;
  let retypenewpassword = req.body.retypenewpassword;

  console.log(oldpassword, newpassword, retypenewpassword);

  if (newpassword !== retypenewpassword) {
    flag = 1;
    res.render('settings', {
      flag: flag
    })
  } else {
    Register.findOne({
      _id: loginDetails.id,
      password: oldpassword
    }, (err, doc) => {
      if (err) {
        console.log("Stuck here");
        res.send(err);
      } else if (!doc) {
        console.log('User details unavailable');
        flag = 2;
        res.render('settings', {
          flag: flag
        })
      } else {
        console.log("Found user");
        var myquery = {
          _id: loginDetails.id
        };

        var newvalues = {
          $set: {
            password: newpassword
          }
        };

        Register.updateOne(myquery, newvalues, function(err, response) {
          if (err) {
            res.send("Hi");
          } else {
            flag = 3;
            console.log("Password changed");
            res.render('settings', {
              flag: flag
            })
          }
        });
      }
    })
  }
})

app.get("/products", function(req, res) {
  // res.sendFile(path.join(__dirname, 'views/products.html'));
  // var userId = loginDetails.id;

  userModel.find({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {

      // res.send(JSON.stringify(result));
      // console.log(JSON.stringify(result));

      // console.log(userId);
      console.log(result);

      res.render('products', {
        // userId: userId,
        practices: result
      })
    }
  })
})

app.get("/signup", function(req, res) {
  // res.sendFile(path.join(__dirname, 'views/signup.html'));
  res.render('signup', {
    // userId: userId,
    newUser: newUser
  })
})

app.post("/signup", async (req, res) => {
  try {

    console.log(req.body);
    // res.send(req.body.name);

    const registerUser = new Register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      city: req.body.city,
      address: req.body.address,
      type: req.body.type
    })

    const registered = await registerUser.save();
    console.log(registerUser);

    ////////////////////////////////////////////////////
    Register.findOne({
      email: req.body.email
    }, (err, doc) => {
      if (err) {
        console.log(err);
      } else if (!doc) {
        console.log('User details unavailable');
        // newUser = 1;
        // res.redirect('/signup');
        res.send('User details unavailable');
      } else {

        if (doc.type === "buyer") {
          // res.redirect('/products');
          // INSERT INTO buyer VALUES ("624ecace19326b6e224c7b8b", 5000);
          let sql = `INSERT INTO buyer VALUES ("${doc.id}", 100000);`;
          mysqlConnection.query(sql, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect("/login");
          });
        }
        if (doc.type === "seller") {
          let sql = `INSERT INTO seller VALUES ("${doc.id}", 0);`;
          mysqlConnection.query(sql, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect("/login");
          });
        }
      }
    })
    // res.send(registerUser.type);
    // res.status(201).render("views/index.html");
    // res.redirect("/login");
  } catch (error) {
    res.status(400).send(error);
  }
})

app.get("/login", function(req, res) {
  newUser = 0;
  loginDetails = {
    id: "NULL",
    name: "NULL",
    email: "NULL",
    password: "NULL",
    phone: "NULL",
    city: "NULL",
    address: "NULL",
    type: "NULL"
  }
  res.sendFile(path.join(__dirname, 'views/login.html'));
})

// app.post("/signup", async (req, res) => {
//   try {
//
//     const registered = await registerUser.save();
//     console.log(registerUser);
//     res.send(registerUser);
//     // res.status(201).render("views/index.html");
//   } catch (error) {
//     res.status(400).send(error);
//   }
// })


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
      newUser = 1;
      res.redirect('/signup');
    } else {
      // isLogin = 1;
      loginDetails.id = doc.id;
      loginDetails.name = doc.name;
      loginDetails.email = doc.email;
      loginDetails.password = doc.password;
      loginDetails.phone = doc.phone;
      loginDetails.address = doc.address;
      loginDetails.type = doc.type;
      if (doc.type === "buyer") {
        res.redirect('/products');
      }
      if (doc.type === "seller") {
        res.redirect('/seller');
      }
    }
  })
})

// app.get('/check', function(req, res) {
//   res.sendFile(path.join(__dirname, 'views/cart.html'));
// })

app.get('/check/:productId', function(req, res) {
  var productId = req.params.productId;
  const addToCart = {
    buyer_id: "NULL",
    seller_id: "NULL",
    product_name: "NULL",
    product_description: "NULL",
    product_price: -1,
    image: "NULL"
  };

  console.log("id: " + productId);

  //Get product data
  userModel.findOne({
    _id: productId
  }, (err, doc) => {
    if (err) {
      console.log(err);
    } else if (!doc) {
      console.log('User details unavailable');
      res.send('User details unavailable');
    } else {
      addToCart.buyer_id = loginDetails.id;
      addToCart.seller_id = doc.seller_id;
      addToCart.product_name = doc.product_name;
      addToCart.product_description = doc.product_description;
      addToCart.product_price = doc.product_price;
      addToCart.image = doc.image;

      //Save in Database
      const addToDB = new Cart({
        buyer_id: addToCart.buyer_id,
        seller_id: addToCart.seller_id,
        product_name: addToCart.product_name,
        product_description: addToCart.product_description,
        product_price: addToCart.product_price,
        image: addToCart.image
      })

      addToDB.save()
        .then(item => {
          // res.send(item);
          res.redirect('/cart');
        })
        .catch(err => {
          res.send(err)
        });

      // res.send(addToCart);
    }
  })



  // res.send(addToCart);

  // Update cart
  // res.send(req.params.productId);
  // res.sendFile(path.join(__dirname, 'views/cart.html'));
})


app.get("/cart", function(req, res) {
  var userId = loginDetails.id;

  Cart.find({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {

      // res.send(JSON.stringify(result));
      // console.log(JSON.stringify(result));

      console.log(userId);
      console.log(result);

      res.render('cart', {
        userId: userId,
        practices: result
      })
    }
  })
});

app.post("/search_results", function(req, res) {
  console.log(req.body.searchText);
  var searchString = req.body.searchText;

  userModel.find({}, function(err, result) {
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
