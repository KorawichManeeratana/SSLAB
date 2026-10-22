import { NextResponse } from 'next/server';
import { prisma } from '@sslab/db';


// 1. GET: ดึงข้อมูล
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get('entity');

  if (!entity || !(prisma as any)[entity]) {
    return NextResponse.json({ error: 'Invalid Entity' }, { status: 400 });
  }

  try {
    const data = await (prisma as any)[entity].findMany({
      take: 100,
      orderBy: { id: 'desc' },
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: สร้างข้อมูลใหม่
export async function POST(request: Request) {
  try {
    const { entity, data } = await request.json();

    if (!entity || !(prisma as any)[entity]) {
      return NextResponse.json({ error: 'Invalid Entity' }, { status: 400 });
    }

    const createdRecord = await (prisma as any)[entity].create({ data });
    return NextResponse.json({ success: true, data: createdRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. PUT: แก้ไขข้อมูลเดิม
export async function PUT(request: Request) {
  try {
    const { entity, id, data } = await request.json();

    if (!entity || !(prisma as any)[entity] || !id) {
      return NextResponse.json({ error: 'Invalid Entity or ID' }, { status: 400 });
    }

    // ตัด field id และ created_at ออกจาก payload ก่อน update
    const { id: _, created_at, exc_update, update, ...updateData } = data;

    const updatedRecord = await (prisma as any)[entity].update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE: ลบข้อมูล
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const id = searchParams.get('id');

    if (!entity || !(prisma as any)[entity] || !id) {
      return NextResponse.json({ error: 'Invalid Entity or ID' }, { status: 400 });
    }

    await (prisma as any)[entity].delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}