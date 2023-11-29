const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  // Criteria for a valid username
  // - Should have a minimum length of 3 characters
  // - The first character should be a letter or an underscore
  // - The remaining characters should be letters, numbers, or special characters without space

  const regex = /^[A-Za-z_][^\s]{2,}$/;
  let isvalid = regex.test(username);
  console.log("isvalid username:" + isvalid);//just for test
  return isvalid;

}

const isValidPassword = (password) => {
  // Check if the password length is more than 7 characters
  if (password.length < 8) {
    return false;
  };

  // Check if the password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  };

  // Check if the password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  };

  // Check if the password contains at least one number
  if (!/[0-9]/.test(password)) {
    return false;
  };

  // Check if the password contains at least one special character
  if (!/[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?`~]/.test(password)) {
    return false;
  };

  // All criteria are met, password is valid
  return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validuser = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validuser.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)){
    let myAccessToken = jwt.sign({data:password},'access',{expiresIn:60*60*12});
    req.session.authorization = { myAccessToken, username};
    return res.status(200).json({message: "User successfully logged in"});

  } else{
    return res.status(208).json({message: "Invalid login. Check username and password"});
  }
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const newreview = req.body.review; 
  let thebook = books[isbn];
  console.log("thebook: " + JSON.stringify(thebook,null,4))//just for test
  let reviews = thebook.reviews // for example {"user1":"reviews1", "user2":"reviews2"}
  console.log("reviews " + JSON.stringify(reviews,null,4))//just for test
  let currentUser = req.session.authorization.username;
  console.log("currentUser: " + JSON.stringify(currentUser,null,4))//just for test
  let theReviews = reviews[currentUser];
  console.log("user's reviews: " + JSON.stringify(theReviews,null,4))//just for test
  console.log("session.authorization : " + JSON.stringify(req.session.authorization,null,4))//just for test
  if (!(newreview ===theReviews)){
    reviews[currentUser] = newreview;
    res.send(` the user ${currentUser} 's reviews updated`);
  }
  console.log(" the user:" + currentUser + "  the reviews:" + theReviews); // just for test

});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  let thebook = books[isbn];
  console.log("thebook: " + JSON.stringify(thebook,null,4))//just for test
  let reviews = thebook.reviews // for example {"user1":"reviews1", "user2":"reviews2"}
  console.log("reviews " + JSON.stringify(reviews,null,4))//just for test
  let currentUser = req.session.authorization.username;
  console.log("currentUser: " + JSON.stringify(currentUser,null,4))//just for test
  let theReviews = reviews[currentUser];
  console.log("user's reviews: " + JSON.stringify(theReviews,null,4))//just for test
  console.log("session.authorization : " + JSON.stringify(req.session.authorization,null,4))//just for test
  if (theReviews.length > 0){
    delete reviews[currentUser];
    res.send(` the user ${currentUser} 's reviews has been deleted.`);
  }
  console.log(" the user:" + currentUser + "  the reviews:" + theReviews); // just for test

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.isValidPassword = isValidPassword;

