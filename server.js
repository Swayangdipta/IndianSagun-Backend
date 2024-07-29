const express = require('express')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const {config} = require('./config/config.js')
const { db_connection } = require('./database/connection.js')

// Importing Routers
const authRoutes = require('./routes/Auth.js')
const categoryRoutes = require('./routes/Category.js')
const userRoutes = require('./routes/User.js')
const productRoutes = require('./routes/Product.js')
const couponRoutes = require('./routes/Coupon.js')
const issueRoutes = require('./routes/Issues.js')
const addressRoutes = require('./routes/Address.js')

const app = express()
const PORT = config.PORT || 8000

// Rate Limiting Function for Better Traffic Optimization
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

// MiddleWares
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(limiter)

// Using Routes
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/category',categoryRoutes)
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/product',productRoutes)
app.use('/api/v1/coupon',couponRoutes)
app.use('/api/v1/issue',issueRoutes)
app.use('/api/v1/address',addressRoutes)

// Starting the server
try {
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`)
        db_connection()
    })    
} catch (error) {
    console.log("Server faild to start");
    console.error(error);
}
