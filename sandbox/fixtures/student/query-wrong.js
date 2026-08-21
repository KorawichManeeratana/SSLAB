// ทดลองกรณีนักศึกษาคำตอบผิด: ลืมเงื่อนไข stock > 0
// จะได้หนังสือราคา < 500 มาหมด รวมตัวที่ stock = 0 ด้วย -> เกินมา 1 แถว
exports.solve = function (db) {
  return db.prepare(
    'SELECT id, title, price FROM book WHERE price < 500 ORDER BY price ASC'
  ).all();
};