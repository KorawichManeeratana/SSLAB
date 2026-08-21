// นศ. คำตอบถูก แต่เขียนคนละสไตล์ (ใช้ >= 1 แทน > 0, ใช้ <= 499 แทน < 500)
exports.solve = function (db) {
  const rows = db.prepare('SELECT id, title, price, stock FROM book WHERE price <= 499 AND stock >= 1').all();
  // เรียงเองใน JS แทนการใช้ ORDER BY
  rows.sort((a, b) => a.price - b.price);
  return rows.map(r => ({ id: r.id, title: r.title, price: r.price }));
};