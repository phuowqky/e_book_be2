import express from 'express'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './modules/books/v1/routes.js';


import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()
const app = express()
const PORT = 3000

// app.use(
//   cors({
//     origin: "*",
//     methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
//     allowedHeaders: "Content-Type,Authorization",
//   })
// );
app.use(cors())
// app.options("*", cors());

app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
        return res.status(200).end() // Trả về 200 cho preflight request
    }

    next()
})

app.get('/', (req, res) => {
    res.send('Hello, my name is Phuong Truong Ky, This is my backend server for the e-book application.')
})

app.use("/api/auth", authRoutes);
app.use('/api/books', bookRoutes);

// TODO: 113
// connectDBQuestion1() đang k sử dụng
// Connect to the database
Promise.all([connectDB()])
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server đang chạy tại port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error('Lỗi khi connect MongoDBs:', error)
        process.exit(1)
    })