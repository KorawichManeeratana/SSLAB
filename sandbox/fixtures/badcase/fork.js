// fork bomb เวอร์ชันมี log + สังเกตได้ง่าย
// ต่างจากเวอร์ชันแรก: ลูกที่ spawn ออกไป "ไม่ได้ไป spawn หลานต่อ" (กันลามหนัก)
// แต่ตัวแม่จะ spawn รัว ๆ จนชน --pids-limit=64 แล้วจะ error
// เป้าหมาย: เห็นว่าพอครบ 64 process ระบบ spawn ต่อไม่ได้ -> โยน error

const { spawn } = require('child_process');
 
console.error('[fork] เริ่ม spawn process');
 
let count = 0;
const children = [];
 
while (true) {
  try {
    // แต่ละตัวแค่นอนเฉย ๆ 60 วิ ไม่ไป spawn ต่อ
    const child = spawn(process.execPath, ['-e', 'setTimeout(()=>{}, 60000)']);
    children.push(child);
    count++;
    console.error(`[fork] Successfully Spawn ${count}`);
  } catch (err) {
    // พอชน pids-limit จะเข้าตรงนี้
    console.error(`[fork] Failed to Spawn ${count + 1} -> ${err.code}: ${err.message}`);
    console.error('[fork] === pids-limit ทำงาน! สร้าง process เกินเพดานไม่ได้ ===');
    break;
  }
}
 
console.error(`[fork] จบ: spawn ได้ทั้งหมด ${count} process ก่อนโดนบล็อก`);