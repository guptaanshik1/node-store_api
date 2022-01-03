const mongoose = require('mongoose')
const validator = require("validator");
const bcrypt = require('bcryptjs')

const delivererSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name cannot be empty']
    },
    age: {
        type: String,
        required: [true, 'Age cannot be empty'],
        range: [18, 50]
    },
    email: {
        type: String,
        required: [true, 'Emaiil cannot be empty'],
        validate: [validator.isEmail, 'Wrong format of the email']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be empty'],
        minlength: [6, 'Password cannot be shorter than 6 characters']
    },
    qualification: {
        type: String,
        required: [true, 'Qualification cannot be empty'], 
    },
    resume: {
        id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    address: {
        type: String,
        required: [true, 'Adress cannot be empty'],
        minlength: [10, 'Address cannot be shorter than 10 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: true
    },
})

delivererSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash('password', 10)
})



module.exports = mongoose.model('Deliverers', delivererSchema)