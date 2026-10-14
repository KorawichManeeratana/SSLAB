module.exports = function register(app, db) {
  app.get('/api/books', async (req, res) => {
    const rows = db.prepare('SELECT * FROM books').all()   // wrong table name
    res.json(rows)
  })
}
