import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/db/dbConnect';
import Product from '@/db/models/product';

export const dynamic = 'force-dynamic';



export async function GET() {
  try {
    await dbConnect();
    const result = await mongoose.connection.db!.collection('product').updateMany(
      {},
      { $set: { options: ["M", "L", "XL"] } }
    );
    return NextResponse.json({ success: true, count: result.modifiedCount });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
