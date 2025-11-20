const express = require('express')
const { register, login, getUser } = require('../controllers/AuthController')
const auth = require('../middleware.js/auth')
const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/:id', auth, getUser)

module.exports = authRouter


