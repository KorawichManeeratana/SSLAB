// // src/services/ProductService.ts
// import 'server-only';
// import { ProductRepository, Product } from '@/repositories/ProductRepository';

// export class ProductService {
//   private productRepository: ProductRepository;

//   constructor() {
//     this.productRepository = new ProductRepository();
//   }

//   async purchaseProduct(id: string, quantity: number): Promise<Product> {
//     const product = await this.productRepository.findById(id);
    
//     if (!product) {
//       throw new Error('Product not found');
//     }

//     if (product.stock < quantity) {
//       throw new Error('Insufficient inventory stock available');
//     }

//     const updatedStock = product.stock - quantity;
//     await this.productRepository.updateStock(id, updatedStock);

//     return { ...product, stock: updatedStock };
//   }
// }