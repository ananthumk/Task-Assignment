import Task from "../models/TaskModels.js";

const addTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body

        if (!title || !description || !status || !priority || !dueDate) {
            return res.status(401).json({ message: 'All fields are required' })
        }

        const task = new Task({
            user: req.user.userId,
            title: title,
            description: description,
            status: status,
            priority: priority,
            dueDate: dueDate
        })

        await task.save()
        return res.status(200).json({ message: 'Created Task Successfully', task })
    } catch (error) {
        console.log('error at add task: ', error.message)
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}

const getTask = async (req, res) => {
    try {
        const { status, priority, search, page } = req.query
        const pageNumber = parseInt(page) || 1
        const limit = 6
        const skip = (pageNumber - 1) * limit

        console.log('User role:', req.user.role)
        console.log('Query params:', { status, priority, search, page })

        // Build the base filter
        const filter = {}
        if (status) filter.status = status
        if (priority) filter.priority = priority

        // Add search to filter if provided
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        }

        console.log('Filter being used:', JSON.stringify(filter))

        if (req.user.role === "admin") {
            // First, let's see if there are ANY tasks at all
            const allTasksCount = await Task.countDocuments({})
            console.log('Total tasks in database:', allTasksCount)

            // Count with filter
            const totalTasks = await Task.countDocuments(filter)
            console.log('Tasks matching filter:', totalTasks)

            // Check what statuses actually exist
            const distinctStatuses = await Task.distinct('status')
            console.log('Existing status values:', distinctStatuses)

            const tasks = await Task.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id', 
                        as: 'userInfo'
                    }
                },
                { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        status: 1,
                        priority: 1,
                        createdAt: 1,
                        dueDate: 1,
                        userName: "$userInfo.name",
                        userEmail: "$userInfo.email"
                    }
                }
            ])

            console.log('Tasks returned:', tasks.length)

            return res.status(200).json({ 
                tasks, 
                totalPages: Math.ceil(totalTasks / limit),
                currentPage: pageNumber,
                totalTasks,
                debug: {
                    allTasksInDB: allTasksCount,
                    distinctStatuses,
                    filterUsed: filter
                }
            })
        }

        // Regular user
        const userFilter = { user: req.user.userId, ...filter }
        const totalTasks = await Task.countDocuments(userFilter)

        const tasks = await Task.find(userFilter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })

        return res.status(200).json({ 
            tasks, 
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: pageNumber,
            totalTasks
        })
    } catch (error) {
        console.log('Get Tasks Error:', error.message)
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}

const getTaskById = async (req, res) => {
    try {


        const { id } = req.params


        const task = await Task.find({
            _id: id
        }
        )

        return res.status(200).json({ task })
    } catch (error) {
        console.log('Get Tasks:', error.message)
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}

const updateTask = async (req, res) => {
    try {
        const { status, priority, title, description,dueDate } = req.body
        const { id } = req.params

        const updatedata = {}
        if (status) updatedata.status = status
        if (priority) updatedata.priority = priority
        if (title) updatedata.title = title
        if (description) updatedata.description = description 
        if (dueDate) updatedata.dueDate = dueDate

        const updatedTask = await Task.findByIdAndUpdate(
            { _id: id, user: req.user.userId }, updatedata, { new: true }
        )

        if (!updatedTask) {
            return res.status(400).json({ message: 'Task not found' })
        }
        return res.status(200).json({ message: 'Updated Successfully', task: updatedTask })
    } catch (error) {
        console.log('Error at update task: ', error.message)
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}

const getSummary = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.userId })
        const totalTasks = tasks.length

        const openTaskList = tasks.filter(task => task.status === 'Open')
        const openTasks = openTaskList.length

        console.log('get summary', openTaskList)

        let taskByPriority = {
            High: 0, Medium: 0, Low: 0
        }
        openTaskList.forEach(task => {
            if (task.priority in taskByPriority) {

                taskByPriority[task.priority] += 1
            }
        });

        const now = new Date()
        const threeDaysLater = new Date(now)
        threeDaysLater.setDate(now.getDate() + 3)

        const dueSoonCount = openTaskList.filter(task => {
            const dueDate = new Date(task.dueDate)
            return dueDate >= now && dueDate <= threeDaysLater
        }).length

        const dueDateCount = {}
        tasks.forEach(task => {
            const dueDay = task.dueDate.toISOString().slice(0, 10)
            dueDateCount[dueDay] = (dueDateCount[dueDay] || 0) + 1
        })

        let busiestDay = null
        let maxCount = 0
        for (const day in dueDateCount) {
            if (dueDateCount[day] > maxCount) {
                maxCount = dueDateCount[day]
                busiestDay = day
            }
        }

        let dominantPriority = "None"
        let maxPriorityCount = 0
        for (const [priority, count] of Object.entries(taskByPriority)) {
            if (count > maxPriorityCount) {
                maxPriorityCount = count
                dominantPriority = priority
            }
        }

        const summary = `You have ${openTasks} open tasks. Most are ${dominantPriority} priority and ${dueSoonCount} are due soon`
        return res.status(200).json({
            totalTasks,
            openTasks,
            taskByPriority,
            dueSoonCount,
            busiestDay,
            summary
        })
    } catch (error) {
        console.log('Error at get summary: ', error.message)
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params

        await Task.deleteOne({ userId: req.user.id, _id: id })
        return res.status(200).json({ message: 'Successfully task is deleted' })
    } catch (error) {
        console.log('ERror at deleting task: ', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

export { addTask, getTask, getTaskById, updateTask, getSummary, deleteTask }