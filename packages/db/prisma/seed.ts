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

  for (const lec of LECTURES) {
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