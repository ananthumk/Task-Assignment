const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type:String, required: true},
    description: {type: String, required: true},
    priority : {type: String, enum: ['Low','Medium','High'], default: 'low'},
    dueDate: {type: Date, required: true},
    status: {type: String, enum: ['pending', 'In Progress', 'completed'], default: 'Open'}
}, {timestamps: true})

const Task = mongoose.model('Task', taskSchema)
module.exports = Task 