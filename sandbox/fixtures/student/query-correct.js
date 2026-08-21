// โค้ด นศ. ที่ถูก
exports.solve = function (db) {
    return db.prepare("SELECT id, title, price FROM book WHERE price < 500 AND stock > 0 ORDER BY price ASC").all();
}