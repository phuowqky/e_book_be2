// import { MongoClient } from 'mongodb';

// const uri = 'mongodb+srv://tranvantam310:7azWE0DzUUH9BgrM@cluster0.facv7wt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// let questionDB;

// async function connectDBQuestion1() {
//   const client = new MongoClient(uri, {
//     serverSelectionTimeoutMS: 50000,
//   });

//   try {
//     await client.connect();
//     console.log('Kết nối MongoDB Atlas QUESTION thành công!');

//     // TODO: 113
//     questionDB = client.db('crud');
//     // questionDB = client.db('data');
//   } catch (error) {
//     console.error('Lỗi kết nối MongoDB QUESTION:', error);
//     throw error;
//   }
// }

// function getCollectionQuestion(collectionName) {
//   if (!questionDB) {
//     throw new Error('QUESTION DB chưa được kết nối. Hãy chạy connectDBQuestion1 trước!');
//   }
//   return questionDB.collection(collectionName);
// }

// export { connectDBQuestion1, getCollectionQuestion };