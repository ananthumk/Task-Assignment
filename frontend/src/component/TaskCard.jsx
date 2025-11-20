import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RiEdit2Fill } from "react-icons/ri";
import { MdOutlineDelete } from "react-icons/md";
import axios from 'axios'
import AppContext from "../context/AppContext";
import { useContext } from "react";
import { toast, ToastContainer } from 'react-toastify';

export default function TaskCard({task}){
    const navigate = useNavigate()

    const {token, url} = useContext(AppContext)

    const handleDelete = async (id) => {
        console.log(id)
        try {
            const resposne = await axios.delete(`${url}/task/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if(resposne.status === 200 || response.status === 201){
                console.log('done')
                      toast.success("Successfully task is deleted");
            }
        } catch (error) {
            console.log('Error at delete task /taskcard: ', error.message)
            toast.error('Failed to delete task')
        }
    }
    return(
        <div  key={task._id} className="sm:max-w-[340px] flex flex-col gap-2 bg-white rounded py-2 px-4">
            <div className="flex w-full justify-between items-center">
            <h3 className="text-[14px] sm:text-[15px]">{task.title}</h3> 
            <div className="flex items-center gap-2">
            <RiEdit2Fill onClick={() => navigate(`/edit/${task._id}`, {state: {task} })} className="w-4 h-4 cursor-pointer" /> 
            <MdOutlineDelete onClick={() => {handleDelete(task._id)}} className="w-4 h-4 hover:text-red-600 cursor-pointer" />
            </div>
            </div>
            <p className="text-[11px]">{task.description}</p>
            <div className="flex items-center justify-between">
            <div className={`py-0.5 px-1.5 ${task.priority === 'High' ? 'bg-red-200' : task.priority === 'Medium' ? 'bg-yellow-200' : 'bg-green-300' } rounded-md`}>
                <p className="text-[10px]">{task.priority}</p>
            </div>
            <p className={`text-[11px] ${task.status === 'Open' ? 'text-red-500' : task.status === 'In Progress' ? 'text-blue-600' : 'text-green-500' }`}>{task.status}</p>
            </div>
            <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-3 h-3" />
                <p className="text-[10px]">{task.dueDate}</p>
            </div>
            
            <ToastContainer position="bottom-right" autoClose={3000}/>
        </div>
    )
}