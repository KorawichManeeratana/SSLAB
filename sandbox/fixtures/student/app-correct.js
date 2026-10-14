module.exports = function register(app, db) {
  app.get('/api/books', (req, res) => {
    const maxPrice = Number(req.query.maxPrice)
    if (!Number.isFinite(maxPrice)) {
      return res.status(400).json({ error: 'maxPrice must be a number' })
    }
    const rows = db
      .prepare('SELECT id, title, price FROM book WHERE price < ? AND stock > 0 ORDER BY price')
      .all(maxPrice)
    res.json(rows)
  })
}
