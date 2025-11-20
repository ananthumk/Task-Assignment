import { useState, useContext } from "react";
import Navbar from "./Navbar";
import AppContext from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Task() {
    const [taskDetails, setTaskDetails] = useState({
        title: '', description: '', priority: 'Low', status: 'pending', dueDate: ''
    })
    const [errMsg, setErrMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const handleChanges = (e) => {
        const {name, value} = e.target 
        setTaskDetails(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const navigate = useNavigate()
    
    const {url, token} = useContext(AppContext)
    console.log(`url: ${url}, token: ${token}`)

    const handleSubmit = async (e) => {
       e.preventDefault()
       console.log(taskDetails)
       try {
          const urlString = `${url}/tasks`
          const options = {
            method: 'POST',
            body: JSON.stringify(taskDetails),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
          }
          const response = await fetch(urlString, options)
          const data = await response.json()
          if(response.ok){
            setErrMsg('')
            setSuccessMsg('Task Added')
            setTimeout(() => {
                navigate('/')
            }, 1000);
            
          } else {
            setSuccessMsg('')
            setErrMsg(data.message)
          }
       } catch (error) {
         setErrMsg(error.message)
         setSuccessMsg('')
       }
    }
    return (
        <div>
        <Navbar />
        <div className="w-full z-1 min-h-[90vh] bg-neutral-100 flex justify-center items-center">
            <div className="bg-white rounded fixed  w-[90%] sm:w-[80%] md:min-w-[300px] max-w-[400px] p-3 md:p-5 flex flex-col justify-center gap-4">
                <h1 className="text-lg sm:text-xl font-bold">Add New Task</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-light">Task Title</label>
                        <input required name="title" onChange={handleChanges} type="text" className="w-full text-[13px] py-3 px-6 border border-gray-300 rounded-md" placeholder="Enter task title" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-light">Description</label>
                        <textarea name="description" onChange={handleChanges} type="text" className="w-full text-[13px] py-2 px-6 min-h-[70px] border border-gray-300 rounded-md" placeholder="Enter task description" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-light">Priority</label>
                            <select name="priority" onChange={handleChanges} className="p-2 text-[11px] border rounded outline-0 border-gray-300">
                                <option className="p-2 text-[11px]" value="Low">LOW</option>
                                <option className="p-2 text-[11px]" value="Medium">MEDIUM</option>
                                <option className="p-2 text-[11px]" value="High">HIGH</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-light">Status</label>
                            <select name="status" onChange={handleChanges} className="p-2 text-[11px] order rounded border outline-0 border-gray-300">
                                <option className="p-2 text-[11px]" value="pending">PENDING</option>
                                <option className="p-2 text-[11px]" value="In Progress">IN PROGRESS</option>
                                <option className="p-2 text-[11px]" value="completed">COMPLETED</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-light">Due Date</label>
                            <input required name="dueDate" onChange={handleChanges} type="date" className="p-2 text-[11px] border rounded outline-0 border-gray-300" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 min-h-[30px] gap-6">
                        <button className="py-2 text-[13px] bg-blue-600 text-white cursor-pointer">
                             Create Task
                        </button>
                        <button onClick={() => {navigate('/')}} className="py-2 text-[13px] text-gray-900 bg-gray-300  cursor-pointer">
                             Cancel
                        </button>
                    </div>
                    {errMsg && <p className="text-[11px] text-center text-red-500">{errMsg}</p>}
                    {successMsg && <p className="text-[11px] text-center text-green-500">{successMsg}</p>}
                </form>
            </div>
        </div>
        </div>
    )
}