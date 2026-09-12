// src/repositories/ProductRepository.ts
import 'server-only'; // Enforces that this code only runs on the server
import { db } from '@/lib/db'; // Your database client instance

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class ProductRepository {
  async findById(id: string): Promise<Product | null> {
    // Replace with your ORM: e.g., return db.product.findUnique({ where: { id } })
    return await db.query('SELECT * FROM products WHERE id = $1', [id]);
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    await db.query('UPDATE products SET stock = $2 WHERE id = $1', [id, newStock]);
  }
}