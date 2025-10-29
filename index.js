import express from 'express'
import { connectDB } from './config/db.js'
import './config/supabase.js' // Import Supabase config
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './modules/books/v1/routes.js';
import userRoutes from './routes/user_routes.js'
import chapterRouter from './modules/chapters/v1/chapters_routes.js'
import reviewBookRouter from './modules/rating_book/review_book_routes.js'
import trendingBookRouters from './modules/trending_book/trending_book_routes.js'
import randomBookRoutes from './modules/random_book/random_book_routes.js'
import newBookRoutes from './modules/new_book/new_book_routes.js'
import bookmarkRoutes from './modules/boolmarks/v1/bookmark_routes.js'
import bannerRoutes from './modules/banner/banner_routes.js'

import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()
const app = express()
const PORT = 3000


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
app.use("/api/users", userRoutes);
app.use("/api/chapters", chapterRouter);
app.use("/api/reviews", reviewBookRouter);
app.use("/api/trending-books", trendingBookRouters);
app.use("/api/random-books", randomBookRoutes);
app.use("/api/new-books", newBookRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/banners", bannerRoutes);

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