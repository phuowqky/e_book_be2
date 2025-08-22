import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const uri = "mongodb+srv://phuongtruongky14012004:Ky14012004@cluster0.ppjub2a.mongodb.net/e_book_be";

let mainDB;

async function connectDB() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 50000,
  });

  try {
    await client.connect();
    console.log('Kết nối MongoDB Atlas MAIN thành công!');
    mainDB = client.db('crud');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB MAIN:', error);
    throw error;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 50000,
    });
    console.log('Kết nối Mongoose thành công!');
  } catch (error) {
    console.error('Lỗi kết nối Mongoose:', error);
    throw error;
  }

}

function getCollection(collectionName) {
  if (!mainDB) {
    throw new Error('MAIN DB chưa được kết nối. Hãy chạy connectDB trước!');
  }
  return mainDB.collection(collectionName);
}

export { connectDB, getCollection };