// เผื่อกรณีเกิด  infinite loop จากโค้ดของนักษึกษา
// วนไม่รู้จบตั้งแต่ก่อน server เปิด -> harness ค้างที่ require() เลย
// ทดสอบตัว timeout
// อันนี้ตัว harness เรายังไม่มีถ้าเอาไปทำจิงต้องพึ่ง worker 
const express = require('express');
const app = express();
 
while (true) {
  // วนแบบ ไม่จบ อาจกิน CPU
}
 
module.exports = app; // บรรทัดนี้ไม่มีวันถูกรัน