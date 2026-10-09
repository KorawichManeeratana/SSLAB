// packages/db/prisma/seed.ts
// Development sample data — safe to re-run (clears existing data first)
// Run: npm run seed -w @sslab/db
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient()

const STARTER_CODE = `exports.solve = function (db) {
  // db is a node:sqlite DatabaseSync instance
  // Example: return db.prepare('SELECT * FROM table_name').all()
  return []
}
`

// Each exercise is self-contained: its own schema, seed data and reference solution.
// The harness runs the solution and the student's code on two fresh copies
// of the same database and compares the returned rows.
// @@EXERCISES_START
const LECTURES = [
  {
    lecture_name: 'SQL Basics: Filtering and Sorting',
    lecture_week: '1',
    exercises: [
      {
        exc_name: 'Affordable Books in Stock',
        exc_difficulty: 'novice',
        exc_description:
          'Write a function solve(db) that returns every book priced below 500 that still has stock (stock greater than 0). ' +
          'Return only the columns id, title and price, sorted by price from lowest to highest.',
        exc_schema:
          'CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT NOT NULL, price INTEGER NOT NULL, stock INTEGER NOT NULL);',
        exc_seed:
          "INSERT INTO book VALUES " +
          "(1,'Node Basics',350,5)," +
          "(2,'Express in Action',450,0)," +
          "(3,'Prisma Deep Dive',600,3)," +
          "(4,'SQL 101',200,10)," +
          "(5,'JavaScript Tips',480,2)," +
          "(6,'Docker for Devs',520,0);",
        exc_solution:
          'SELECT id, title, price FROM book WHERE price < 500 AND stock > 0 ORDER BY price ASC',
        order_matters: true,
      },
      {
        exc_name: 'Authors from Thailand',
        exc_difficulty: 'novice',
        exc_description:
          "Write a function solve(db) that returns all authors whose country is 'Thailand'. " +
          'Return only the columns id and name, sorted alphabetically by name (A to Z).',
        exc_schema:
          'CREATE TABLE author (id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL);',
        exc_seed:
          "INSERT INTO author VALUES " +
          "(1,'Somchai Jaidee','Thailand')," +
          "(2,'Alice Walker','USA')," +
          "(3,'Anong Srisuk','Thailand')," +
          "(4,'Kenji Sato','Japan')," +
          "(5,'Pim Rattanakul','Thailand')," +
          "(6,'Maria Garcia','Spain');",
        exc_solution:
          "SELECT id, name FROM author WHERE country = 'Thailand' ORDER BY name ASC",
        order_matters: true,
      },
      {
        exc_name: 'Top 3 Most Expensive Products',
        exc_difficulty: 'novice',
        exc_description:
          'Write a function solve(db) that returns the 3 most expensive products. ' +
          'Return the columns id, name and price, sorted by price from highest to lowest. ' +
          'If two products have the same price, the one with the smaller id comes first.',
        exc_schema:
          'CREATE TABLE product (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price INTEGER NOT NULL);',
        exc_seed:
          "INSERT INTO product VALUES " +
          "(1,'Keyboard',1200)," +
          "(2,'Mouse',450)," +
          "(3,'Monitor',5900)," +
          "(4,'Headset',1200)," +
          "(5,'Webcam',1500)," +
          "(6,'USB Hub',390);",
        exc_solution:
          'SELECT id, name, price FROM product ORDER BY price DESC, id ASC LIMIT 3',
        order_matters: true,
      },
    ],
  },
  {
    lecture_name: 'Aggregation and Grouping',
    lecture_week: '2',
    exercises: [
      {
        exc_name: 'Count Books per Category',
        exc_difficulty: 'adept',
        exc_description:
          'Write a function solve(db) that counts how many books belong to each category. ' +
          'Return one row per category with the columns category and total. The order of rows does not matter.',
        exc_schema:
          'CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL);',
        exc_seed:
          "INSERT INTO book VALUES " +
          "(1,'Node Basics','Backend')," +
          "(2,'React Hooks','Frontend')," +
          "(3,'Express in Action','Backend')," +
          "(4,'SQL 101','Database')," +
          "(5,'CSS Grid','Frontend')," +
          "(6,'Prisma Deep Dive','Database')," +
          "(7,'NestJS Guide','Backend');",
        exc_solution:
          'SELECT category, COUNT(*) AS total FROM book GROUP BY category',
        order_matters: false,
      },
      {
        exc_name: 'Categories with Enough Stock',
        exc_difficulty: 'adept',
        exc_description:
          'Write a function solve(db) that sums the stock of all products in each category ' +
          'and returns only the categories whose total stock is at least 10. ' +
          'Return the columns category and total_stock, sorted by total_stock from highest to lowest.',
        exc_schema:
          'CREATE TABLE product (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, stock INTEGER NOT NULL);',
        exc_seed:
          "INSERT INTO product VALUES " +
          "(1,'Keyboard','Accessories',4)," +
          "(2,'Mouse','Accessories',8)," +
          "(3,'Monitor','Displays',3)," +
          "(4,'Projector','Displays',1)," +
          "(5,'SSD 1TB','Storage',15)," +
          "(6,'HDD 2TB','Storage',6)," +
          "(7,'USB Hub','Accessories',2);",
        exc_solution:
          'SELECT category, SUM(stock) AS total_stock FROM product GROUP BY category HAVING SUM(stock) >= 10 ORDER BY total_stock DESC',
        order_matters: true,
      },
    ],
  },
  {
    lecture_name: 'Joining Tables',
    lecture_week: '3',
    exercises: [
      {
        exc_name: 'Orders with Customer Names',
        exc_difficulty: 'adept',
        exc_description:
          'Write a function solve(db) that lists every order together with the name of the customer who placed it. ' +
          'Return the columns order_id, customer_name and amount, sorted by order_id from lowest to highest.',
        exc_schema:
          'CREATE TABLE customer (id INTEGER PRIMARY KEY, name TEXT NOT NULL);' +
          'CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customer(id), amount INTEGER NOT NULL);',
        exc_seed:
          "INSERT INTO customer VALUES (1,'Nattapong'),(2,'Siriporn'),(3,'Krit'),(4,'Mali');" +
          "INSERT INTO orders VALUES (101,1,1200),(102,2,450),(103,1,300),(104,3,980),(105,2,150);",
        exc_solution:
          'SELECT o.id AS order_id, c.name AS customer_name, o.amount FROM orders o JOIN customer c ON c.id = o.customer_id ORDER BY o.id ASC',
        order_matters: true,
      },
      {
        exc_name: 'Customers Without Orders',
        exc_difficulty: 'expert',
        exc_description:
          'Write a function solve(db) that finds every customer who has never placed an order. ' +
          'Return the columns id and name, sorted by id from lowest to highest.',
        exc_schema:
          'CREATE TABLE customer (id INTEGER PRIMARY KEY, name TEXT NOT NULL);' +
          'CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customer(id), amount INTEGER NOT NULL);',
        exc_seed:
          "INSERT INTO customer VALUES (1,'Nattapong'),(2,'Siriporn'),(3,'Krit'),(4,'Mali'),(5,'Thanakorn');" +
          "INSERT INTO orders VALUES (101,1,1200),(102,2,450),(103,1,300),(104,2,150);",
        exc_solution:
          'SELECT c.id, c.name FROM customer c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.id ASC',
        order_matters: true,
      },
      {
        exc_name: 'Total Spent per Customer',
        exc_difficulty: 'expert',
        exc_description:
          'Write a function solve(db) that calculates how much each customer has spent in total. ' +
          'Customers who have never ordered must still appear with a total of 0. ' +
          'Return the columns id, name and total_spent, sorted by total_spent from highest to lowest; ' +
          'if two customers spent the same amount, the one with the smaller id comes first.',
        exc_schema:
          'CREATE TABLE customer (id INTEGER PRIMARY KEY, name TEXT NOT NULL);' +
          'CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customer(id), amount INTEGER NOT NULL);',
        exc_seed:
          "INSERT INTO customer VALUES (1,'Nattapong'),(2,'Siriporn'),(3,'Krit'),(4,'Mali');" +
          "INSERT INTO orders VALUES (101,1,1200),(102,2,450),(103,1,300),(104,3,980),(105,2,1050);",
        exc_solution:
          'SELECT c.id, c.name, COALESCE(SUM(o.amount), 0) AS total_spent FROM customer c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name ORDER BY total_spent DESC, c.id ASC',
        order_matters: true,
      },
    ],
  },
] as const
// @@EXERCISES_END

// ---------------------------------------------------------------------------
// Advanced exercises: multiple tables, foreign keys, self-joins, window functions
// Several exercises share one database so students can reuse what they learned.
// ---------------------------------------------------------------------------
const SCHOOL_SCHEMA =
  'CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT NOT NULL, year INTEGER NOT NULL);' +
  'CREATE TABLE course (id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE, title TEXT NOT NULL);' +
  'CREATE TABLE enrollment (id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES student(id), course_id INTEGER NOT NULL REFERENCES course(id), score INTEGER);'

const SCHOOL_SEED =
  "INSERT INTO student VALUES (1,'Arthit',2),(2,'Benjamas',3),(3,'Chalerm',2),(4,'Duangjai',4),(5,'Ekachai',3),(6,'Fah',2);" +
  "INSERT INTO course VALUES (1,'WEB201','Server-Side Web Development'),(2,'DB101','Database Systems'),(3,'NET210','Computer Networks'),(4,'SEC300','Web Security'),(5,'AI350','Applied Machine Learning');" +
  'INSERT INTO enrollment VALUES ' +
  '(1,1,1,78),(2,2,1,91),(3,3,1,NULL),(4,4,1,91),' +
  '(5,1,2,65),(6,2,2,88),(7,5,2,72),' +
  '(8,3,3,NULL),(9,6,3,NULL),' +
  '(10,4,4,95),(11,5,4,83),(12,6,4,95);'

const SHOP_SCHEMA =
  'CREATE TABLE customer (id INTEGER PRIMARY KEY, name TEXT NOT NULL);' +
  'CREATE TABLE product (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL);' +
  'CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customer(id), order_date TEXT NOT NULL);' +
  'CREATE TABLE order_item (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL REFERENCES product(id), quantity INTEGER NOT NULL, unit_price INTEGER NOT NULL);'

const SHOP_SEED =
  "INSERT INTO customer VALUES (1,'Nattapong'),(2,'Siriporn'),(3,'Krit'),(4,'Mali'),(5,'Thanakorn');" +
  "INSERT INTO product VALUES (1,'Mechanical Keyboard','Electronics',2500),(2,'Wireless Mouse','Electronics',800),(3,'Desk Lamp','Home',650),(4,'Notebook A5','Stationery',45),(5,'Gel Pen Set','Stationery',120),(6,'Office Chair','Home',4200),(7,'USB-C Hub','Electronics',1100);" +
  "INSERT INTO orders VALUES (1,1,'2026-01-05'),(2,2,'2026-01-18'),(3,1,'2026-02-02'),(4,3,'2026-02-14'),(5,4,'2026-02-20'),(6,2,'2026-03-03'),(7,3,'2026-03-11');" +
  'INSERT INTO order_item VALUES ' +
  '(1,1,1,1,2500),(2,1,4,3,45),' +
  '(3,2,3,2,650),(4,2,5,1,120),' +
  '(5,3,2,2,750),(6,3,7,1,1100),' +
  '(7,4,4,10,40),(8,4,5,4,120),' +
  '(9,5,6,1,4200),' +
  '(10,6,1,1,2400),(11,6,3,1,650),' +
  '(12,7,3,3,600);'

const COMPANY_SCHEMA =
  'CREATE TABLE department (id INTEGER PRIMARY KEY, name TEXT NOT NULL);' +
  'CREATE TABLE employee (id INTEGER PRIMARY KEY, name TEXT NOT NULL, salary INTEGER NOT NULL, department_id INTEGER NOT NULL REFERENCES department(id), manager_id INTEGER REFERENCES employee(id));'

const COMPANY_SEED =
  "INSERT INTO department VALUES (1,'Engineering'),(2,'Marketing'),(3,'Finance');" +
  'INSERT INTO employee VALUES ' +
  "(1,'Somsak',95000,1,NULL)," +
  "(2,'Wanida',72000,1,1)," +
  "(3,'Piti',98000,1,1)," +
  "(4,'Kanya',72000,1,2)," +
  "(5,'Anan',60000,2,NULL)," +
  "(6,'Malee',64000,2,5)," +
  "(7,'Chai',58000,2,5)," +
  "(8,'Rattana',80000,3,NULL)," +
  "(9,'Preecha',80000,3,8)," +
  "(10,'Nok',65000,1,2);"

const ADVANCED_LECTURES = [
  {
    lecture_name: 'Multi-Table Joins',
    lecture_week: '4',
    exercises: [
      {
        exc_name: 'Course Enrollment Summary',
        exc_difficulty: 'expert',
        exc_description:
          'The school database has three tables: student, course and enrollment (a student can enroll in many courses). ' +
          'An enrollment with a NULL score has not been graded yet. ' +
          'Write a function solve(db) that returns one row for EVERY course, including courses nobody has enrolled in, with the columns: ' +
          'code, title, enrolled (number of enrollments) and graded (number of enrollments that have a score). ' +
          'Sort by enrolled from highest to lowest; if two courses have the same number, sort by code (A to Z).',
        exc_schema: SCHOOL_SCHEMA,
        exc_seed: SCHOOL_SEED,
        exc_solution:
          'SELECT c.code, c.title, COUNT(e.id) AS enrolled, COUNT(e.score) AS graded ' +
          'FROM course c LEFT JOIN enrollment e ON e.course_id = c.id ' +
          'GROUP BY c.id, c.code, c.title ORDER BY enrolled DESC, c.code ASC',
        order_matters: true,
      },
      {
        exc_name: 'Best-Selling Products by Revenue',
        exc_difficulty: 'expert',
        exc_description:
          'The shop database has four tables: customer, product, orders and order_item. ' +
          'Each order_item stores the quantity and the unit_price paid at the time of the order (which may differ from the current product price). ' +
          'Write a function solve(db) that returns the 3 products with the highest revenue, where revenue = SUM(quantity * unit_price). ' +
          'Return the columns id, name, units_sold and revenue, sorted by revenue from highest to lowest; ' +
          'if two products have the same revenue, the one with the smaller id comes first.',
        exc_schema: SHOP_SCHEMA,
        exc_seed: SHOP_SEED,
        exc_solution:
          'SELECT p.id, p.name, SUM(oi.quantity) AS units_sold, SUM(oi.quantity * oi.unit_price) AS revenue ' +
          'FROM order_item oi JOIN product p ON p.id = oi.product_id ' +
          'GROUP BY p.id, p.name ORDER BY revenue DESC, p.id ASC LIMIT 3',
        order_matters: true,
      },
      {
        exc_name: 'Monthly Sales Report',
        exc_difficulty: 'expert',
        exc_description:
          'Using the shop database, write a function solve(db) that summarises sales per month. ' +
          'order_date is stored as text in the format YYYY-MM-DD. ' +
          "Return the columns month (format 'YYYY-MM'), order_count (number of distinct orders in that month) and revenue (total of quantity * unit_price), " +
          'sorted by month from earliest to latest. ' +
          'Be careful: an order with several items must still be counted as one order.',
        exc_schema: SHOP_SCHEMA,
        exc_seed: SHOP_SEED,
        exc_solution:
          "SELECT substr(o.order_date, 1, 7) AS month, COUNT(DISTINCT o.id) AS order_count, SUM(oi.quantity * oi.unit_price) AS revenue " +
          'FROM orders o JOIN order_item oi ON oi.order_id = o.id ' +
          'GROUP BY month ORDER BY month ASC',
        order_matters: true,
      },
      {
        exc_name: 'Customers Who Never Bought Electronics',
        exc_difficulty: 'expert',
        exc_description:
          'Using the shop database, write a function solve(db) that finds customers who have placed at least one order, ' +
          "but have never bought any product in the 'Electronics' category. " +
          'Customers who have never placed an order must NOT appear in the result. ' +
          'Return the columns id and name, sorted by id from lowest to highest.',
        exc_schema: SHOP_SCHEMA,
        exc_seed: SHOP_SEED,
        exc_solution:
          'SELECT c.id, c.name FROM customer c ' +
          'WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ' +
          'AND NOT EXISTS (' +
          'SELECT 1 FROM orders o JOIN order_item oi ON oi.order_id = o.id JOIN product p ON p.id = oi.product_id ' +
          "WHERE o.customer_id = c.id AND p.category = 'Electronics') " +
          'ORDER BY c.id ASC',
        order_matters: true,
      },
    ],
  },
  {
    lecture_name: 'Self-Joins, Subqueries and Window Functions',
    lecture_week: '5',
    exercises: [
      {
        exc_name: 'Top Scorer per Course',
        exc_difficulty: 'expert',
        exc_description:
          'Using the school database (student, course, enrollment), write a function solve(db) that finds the top-scoring student in each course. ' +
          'Ignore enrollments that have not been graded (score is NULL), and skip courses that have no graded enrollments at all. ' +
          'If two students share the highest score in a course, pick the one with the smaller student id. ' +
          'Return the columns code, student_name and score, sorted by code (A to Z).',
        exc_schema: SCHOOL_SCHEMA,
        exc_seed: SCHOOL_SEED,
        exc_solution:
          'SELECT code, student_name, score FROM (' +
          'SELECT c.code, s.name AS student_name, e.score, ' +
          'ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY e.score DESC, s.id ASC) AS rn ' +
          'FROM enrollment e JOIN course c ON c.id = e.course_id JOIN student s ON s.id = e.student_id ' +
          'WHERE e.score IS NOT NULL) WHERE rn = 1 ORDER BY code ASC',
        order_matters: true,
      },
      {
        exc_name: 'Employees Who Earn More Than Their Manager',
        exc_difficulty: 'expert',
        exc_description:
          'The company database has two tables: department and employee. ' +
          'employee.manager_id points to another row in the same employee table (a self-referencing foreign key); top-level managers have NULL. ' +
          'Write a function solve(db) that returns every employee whose salary is strictly greater than their own manager\'s salary. ' +
          'Return the columns employee, manager and department (the employee\'s department name), sorted by the employee\'s id.',
        exc_schema: COMPANY_SCHEMA,
        exc_seed: COMPANY_SEED,
        exc_solution:
          'SELECT e.name AS employee, m.name AS manager, d.name AS department ' +
          'FROM employee e JOIN employee m ON m.id = e.manager_id JOIN department d ON d.id = e.department_id ' +
          'WHERE e.salary > m.salary ORDER BY e.id ASC',
        order_matters: true,
      },
      {
        exc_name: 'Salary Rank Within Department',
        exc_difficulty: 'expert',
        exc_description:
          'Using the company database, write a function solve(db) that ranks employees by salary inside their own department, highest salary = rank 1. ' +
          'Employees with the same salary in the same department share the same rank, and the next rank is skipped (1, 2, 2, 4). ' +
          'Return the columns department, name, salary and salary_rank, ' +
          'sorted by department name (A to Z), then salary_rank, then employee name (A to Z).',
        exc_schema: COMPANY_SCHEMA,
        exc_seed: COMPANY_SEED,
        exc_solution:
          'SELECT d.name AS department, e.name, e.salary, ' +
          'RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS salary_rank ' +
          'FROM employee e JOIN department d ON d.id = e.department_id ' +
          'ORDER BY department ASC, salary_rank ASC, e.name ASC',
        order_matters: true,
      },
    ],
  },
] as const

async function main() {
  // 1) Clear old data (children before parents to satisfy foreign keys)
  await prisma.user_exercise.deleteMany()
  await prisma.testcase.deleteMany()
  await prisma.exercises.deleteMany()
  await prisma.files.deleteMany()
  await prisma.lectures.deleteMany()
  await prisma.enrolls.deleteMany()
  await prisma.courses.deleteMany()
  await prisma.users.deleteMany()
  await prisma.faculty.deleteMany()

  // 2) Faculty
  const faculty = await prisma.faculty.create({
    data: { fac_name: 'Faculty of Information Technology' },
  })

  // 3) Users — TODO: replace with hashed passwords once auth is implemented
  const teacher = await prisma.users.create({
    data: {
      first_name: 'Test',
      last_name: 'Teacher',
      student_code: 'T0001',
      password: 'TODO_HASH',
      role: 'teacher',
      fac_id: faculty.id,
    },
  })

  const student = await prisma.users.create({
    data: {
      first_name: 'Test',
      last_name: 'Student',
      student_code: '66000001',
      password: 'TODO_HASH',
      role: 'student',
      fac_id: faculty.id,
    },
  })

  // 4) Course + enrollment
  const course = await prisma.courses.create({
    data: {
      course_name: 'Server-Side Web Development',
      creator_id: teacher.id,
    },
  })

  await prisma.enrolls.createMany({
    data: [
      { user_id: teacher.id, course_id: course.id },
      { user_id: student.id, course_id: course.id },
    ],
  })

  // 5) Lectures + exercises
  const exerciseIds: number[] = []

  for (const lec of [...LECTURES, ...ADVANCED_LECTURES]) {
    const lecture = await prisma.lectures.create({
      data: {
        lecture_name: lec.lecture_name,
        lecture_week: lec.lecture_week,
        course_id: course.id,
      },
    })

    for (const ex of lec.exercises) {
      const created = await prisma.exercises.create({
        data: {
          ...ex,
          exc_anwser_field: STARTER_CODE,
          exc_status: 'available',
          exc_type: 'practice',
          lecture_id: lecture.id,
          author_id: teacher.id,
        },
      })
      exerciseIds.push(created.id)
    }
  }

  console.log('Seed completed')
  console.log({
    teacher: teacher.id,
    student: student.id,
    course: course.id,
    exercises: exerciseIds,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())