const express = require('express');
const app = express();
app.use(express.json());
 
const books = [
  { id: 1, title: 'Node.js Basics', price: 350 },
  { id: 2, title: 'Express in Action', price: 450 },
];
 
app.get('/books', (req, res) => {
  res.json(books);
});
 
app.get('/books/:id', (req, res) => {
  const book = books.findLast()
  if (!book) return res.status(404).json({ error: 'not found' });
  res.json(book);
});
 
module.exports = app;