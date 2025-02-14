const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let isValidPassword = require("./auth_users.js").isValidPassword;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const userExit = (username)=>{
  let sameuser = users.filter((user) =>{
    return user.username === username
  });
  if(sameuser.length > 0){
    return true;
  } else {
    return false;
  }  
}

const regUsernameTips = "Username should have a minimum length of 3 characters; he first character should be a letter or an underscore; The remaining characters should be letters, numbers, or special characters without space."
const regPasswordTips = "Password should have a minimum length of 8 characters; at least one lowercase letter, one uppercase letter, one number and one special characters"

const booksJString = JSON.stringify(books);
const parseBooks = JSON.parse(booksJString);

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username === undefined) {
    return res.status(404).json({message: "username is undefined. please provide username, not user..."});
  } else {
    if (isValid(username)){
      if (isValidPassword(password)) {
        if(!userExit(username)) {
          users.push({"username":username, "password":password});
          return res.status(200).json({message: "User < " + username + " > successfully registred. Now you can login."});  
        } else {
          return res.status(404).json({message: "User < " + username + " > already exists. You can login."});
        }
      } else {
        return res.status(404).json({message: regPasswordTips});
      }
    } else {
      return res.status(404).json({message: regUsernameTips});
    }
  }


});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //use promise callback
  const getBooks = new Promise((resolve,reject)=>{
    const data = books;
    try {
      resolve(data);
    } catch(err) {
      reject(err)
    }
  });

  getBooks.then(
    (data) =>  {res.send(JSON.stringify(data,null,4))},
    (err) => {res.send(err.message)} 
  );

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //use promise callback
  const isbn = req.params.isbn;
  const getBookFromIsbn = new Promise((resolve,reject)=>{
    const data = books[isbn];
    try {
      resolve(data);
    } catch(err) {
      reject(err);
    }
  });

  getBookFromIsbn.then(
    (data) =>  {
      if (data === undefined){ // when data is undefined , it go to resolve branch , so need to Differential treatment
        res.send("Can't find the book which isbn=" + isbn);
      } else {
        res.send(JSON.stringify(data,null,4))
      }
    },
    (err) => {res.send( err.message)} 
  );

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //use promise callback
  const author = req.params.author;
  console.log(JSON.stringify(author));// just for test
  //const booksJString = JSON.stringify(books); set it to a global const
  //const parseBooks = JSON.parse(booksJString); set it to a global const
  const getBookFromAuthor = new Promise((resolve,reject)=>{
    const booksJString = JSON.stringify(books);
    const parseBooks = JSON.parse(booksJString); 
    const filteredAuthor = Object.values(parseBooks).filter(obj => obj.author === author);
    const authorCount = filteredAuthor.length;
    const myResult = {
      authorCount:authorCount,
      details:filteredAuthor
    };
    const data = myResult;
    try {
      resolve(data);
    } catch(err) {
      reject(err);
    }
  });

  getBookFromAuthor.then(
    (data) =>  {   
        res.send(JSON.stringify(data,null,4))
    },
    (err) => {res.send( err.message)} 
  );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //use promise callback
  const title = req.params.title;
  const getBookFromTitle = new Promise((resolve,reject)=>{
    const filteredTitles = Object.values(parseBooks).filter(obj => obj.title === title);
    const data = filteredTitles;
    try {
      resolve(data);
    } catch(err) {
      reject(err);
    }
  });

  getBookFromTitle.then(
    (data) =>  {   
        res.send(JSON.stringify(data,null,4))
    },
    (err) => {res.send( err.message)} 
  );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

  const isbn = req.params.isbn;
  const thebook = books[isbn];
  if (thebook) {
    return res.send(JSON.stringify(thebook.reviews,null,4));
  } else {
    return res.status(404).json({message: "Can't find the review of the book which isbn=" + isbn});
  }  
});

module.exports.general = public_users;
