const app = require('./app')
const connectWithDb = require('./config/db')
const cloudinary = require('cloudinary')

connectWithDb()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const { PORT } = process.env

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))