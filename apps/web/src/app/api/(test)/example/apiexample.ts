// import { NextResponse } from 'next/server';
// import { ProductService } from '@/services/ProductService';

// const productService = new ProductService();

// // POST /api/products
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { productId, quantity } = body;

//     if (!productId || !quantity) {
//       return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
//     }

//     // Call the service layer to process the business logic workflow
//     const updatedProduct = await productService.purchaseProduct(productId, Number(quantity));

//     return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || 'Internal Server Error' }, 
//       { status: error.message.includes('not found') ? 404 : 400 }
//     );
//   }
// }