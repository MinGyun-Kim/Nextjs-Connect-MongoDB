import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({path: '.env.local'});

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  const res = await db.collection('product').updateMany(
    { name: "반팔티" },
    { $set: { options: ["M", "L", "XL"] } }
  );
  console.log("Updated!", res.modifiedCount);
  process.exit(0);
}

fix().catch(console.error);
