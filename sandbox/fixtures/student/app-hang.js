module.exports = function register(app, db) {
  app.get('/api/books', (req, res) => { /* never responds */ })
}
