const express = require('express')
const { addTask, getTask, updateTask, getSummary, getTaskById, deleteTask } = require('../controllers/TaskController')
const auth = require('../middleware.js/auth')
const router = express.Router()

router.post('/tasks', auth, addTask)
router.get('/tasks', auth, getTask)
router.get('/task/:id', auth, getTaskById)
router.patch('/tasks/:id', auth, updateTask)
router.get('/insight', auth, getSummary)
router.delete('/task/:id', auth, deleteTask)

module.exports = router


