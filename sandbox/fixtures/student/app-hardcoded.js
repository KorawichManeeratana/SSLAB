// Ignores maxPrice: always uses 500 and never validates input
module.exports = function register(app, db) {
  app.get('/api/books', (req, res) => {
    console.log('debug: query =', req.query)
    res.json(db.prepare('SELECT id, title, price FROM book WHERE price < 500 AND stock > 0 ORDER BY price').all())
  })
}
