# build:  docker build -t sslab-runner .
FROM node:22-slim
 
WORKDIR /app
 
# ลง dependencies ล่วงหน้าตอน build (ตอนตรวจจริง network ถูกตัด ห้าม npm install)
COPY package.json ./
RUN npm install --omit=dev
 
# โค้ดฝั่งเรา: ตัวยิง test
COPY harness/ ./harness/
 
# เตรียมจุด mount ไว้ล่วงหน้า — โค้ดนักศึกษา+โจทย์จะถูกยัดเข้ามาตรงนี้ตอนสร้าง container
RUN mkdir -p student tests && chown -R node:node /app
 
# รันเป็น user ธรรมดา ไม่ใช่ root (uid 1000 มากับ image node อยู่แล้ว)
USER node
 
# คำสั่ง default — ชี้ไปตำแหน่งเดียวกับโครงโปรเจกต์บนเครื่อง dev เป๊ะ ๆ
CMD ["node", "harness/run-tests.js", "student/app.js", "tests/problem1.json"]