// นักศึกษาตัวร้าย #2: memory bomb
// จองหน่วยความจำไปเรื่อย ๆ จนเกินเพดาน แล้วก็ตู้มมมม
// ทดสอบตัว --memory=256m
// ถ้าได้ผล docker ต้อง kill ทิ้ง
const express = require('express');
const app = express();
 
const eatRam = [];
let count = 0;
while (true) {
  // ยัด array ทีละ 10 ล้านช่อง วนไม่หยุด RAM จะพุ่งเร็วมาก สมมุติการยัด RAM ไปเรื่อย ๆ จนกว่าจะโดน kill
  eatRam.push(new Array(10_000_000).fill('x'));
  count++;
  console.error(`[bomb] รอบที่ ${count} -- ยัด RAM ไปแล้ว ~${count * 80}MB`);
}
 
module.exports = app;