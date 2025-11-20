import User from '../models/UserModels.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



const register = async(req, res) => {
    try {
        const {name, email, password, role} = req.body 
        

        if(!name || !email || !password){
            return res.status(401).json({message: 'All fields are required'})
        }

        const userExists = await User.findOne({email})
        if(userExists) return res.status(401).json({message: 'User already exists'})
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({name, email, password: hashedPassword, role})
        await user.save()

        const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWTKEY, {expiresIn: '24h'})
        return res.status(200).json({messsage: 'Successfully registered user', token: token, user: user})
    } catch (error) {
        console.log('Error on register user: ', error.message)
        return res.status(500).json({message: 'Internal Server Error', error: error.message})
    }
}

const login = async(req, res) => {
    try {
        const {email, password} = req.body 
        console.log(email, password)
        
        if(!email || !password){
            return res.status(401).json({message: "Eamil and Password is required"})
        }

        const user = await User.findOne({email})

        if(!user) return res.status(400).json({message: "User not found"})

        const matchPassword = await bcrypt.compare(password, user.password)
        if(!matchPassword) return res.status(401).json({message: "Invalid Password"})

        const token = jwt.sign({userId: user._id, role:user.role}, process.env.JWTKEY, {expiresIn: '24h'})
        return res.status(200).json({message: 'Login', user: user, token: token})
    } catch (error) {
        console.log('Error on login user: ', error.message)
        return res.status(500).json({message: 'Internal Server Error', error: error.message})
    }
}

const getUser = async (req, res) => {
    try {
        const {id} = req.query 
        
        const user = await User.findOne({
            _id: id
        }, {email: 1, name: 1, id: 0})
        
        res.status(200).json(user)

    } catch (error) {
         console.log('Error on get user: ', error.message)
        return res.status(500).json({message: 'Internal Server Error', error: error.message})
    }
}

export {register, login, getUser}