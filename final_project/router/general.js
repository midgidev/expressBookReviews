const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');

public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  const bookList = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
  res.json(bookList);
  res.end();
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = await new Promise((resolve, reject) => {
    setTimeout(() => {
      const book_ = books[isbn];
      resolve(book_);
    }, 1000);
  });
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: `Book not found for isbn ${isbn}` });
  }
  res.end();
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const author = req.params.author;
  const booksByAuthor = await new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByAuthor_ = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
      resolve(booksByAuthor_);
    }, 1000);
  });
  // const booksByAuthor = Object.values(books).filter(book => book.author === author);
  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);
  } else {
    res.status(404).json({ message: `No books found for author ${author}` });
  }
  res.end();
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const title = req.params.title;
  const booksByTitle = await new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByTitle_ = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
      resolve(booksByTitle_);
    }, 1000);
  });
  // const booksByTitle = Object.values(books).filter(book => book.title === title);
  if (booksByTitle.length > 0) {
    res.json(booksByTitle);
  } else {
    res.status(404).json({ message: `No books found for title ${title}` });
  }
  res.end();
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    const reviews = book.reviews;
    if (Object.keys(reviews).length > 0) {
      return res.json(reviews);
    } else {
      return res.status(404).json({ message: `No reviews found for isbn ${isbn}` });
    }
  } else {
    return res.status(404).json({ message: `Book not found for isbn ${isbn}` });
  }
});

public_users.post('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const token = req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const username = decodedToken.username;
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book not found for isbn ${isbn}` });
  }
  const book = books[isbn];
  if (book) {
    if (!book.reviews) {
      book.reviews = {};
    }
    let message = "Review added successfully";
    if(book.reviews[username]) {
      message = "Review updated successfully";
    }
    book.reviews[username] = review;
    return res.status(200).json({ message: message });
  } else {
    return res.status(404).json({ message: `Book not found for isbn ${isbn}` });
  }
});

public_users.delete('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const token = req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const username = decodedToken.username;
  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book not found for isbn ${isbn}` });
  }
  const book = books[isbn];
  if (book) {
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: `No review found for user ${username} on isbn ${isbn}` });
    }
  } else {
    return res.status(404).json({ message: `Book not found for isbn ${isbn}` });
  }
});

module.exports.general = public_users;
