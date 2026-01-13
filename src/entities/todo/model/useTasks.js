import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import taskAPI from '@/shared/api/tasks';

const useTasks = () => {
    const [tasks, setTasks] = useState([]);

    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [disappearingTaskId, setdisappearingTaskId] = useState(null)
    const [appearingTaskId, setAppearingTaskId] = useState(null)

    const newTaskInputRef = useRef(null)

    const deleteAllTasks = useCallback(() => {
        const isConfirmed = confirm("Are you sure you want to delete all tasks?")

        if (isConfirmed) {
            taskAPI.deleteAll(tasks)
            .then(() => setTasks([]))
        }
    }, [tasks])

    const deleteTask = useCallback ( (taskId) => {
        taskAPI.delete(taskId)
        .then(() => {
            setdisappearingTaskId(taskId)
            setTimeout(() => {
                setTasks(
                    tasks.filter((task) => task.id !== taskId)
                )
                setdisappearingTaskId(null)
            }, 400)
        })

    }, [tasks]);

    const toggleTaskComplete = useCallback((taskId, isDone) => {

        taskAPI.toggleComplete(taskId, isDone)
        .then (() => {
            setTasks(
                tasks.map((task) => {
                    if (task.id === taskId) {
                        return { ...task, isDone}
                    }

                    return task;
                })
            )
        })
    }, [tasks]);

    const AddTask = useCallback( (title) => {
        const newTask = {
            title,
            isDone: false,
        }

        taskAPI.add(newTask)
        .then((addedTask) => {
            setTasks((prevTasks) => [...prevTasks, addedTask])
            setNewTaskTitle('')
            setSearchQuery('')
            newTaskInputRef.current?.focus()
            setAppearingTaskId(addedTask.id)
            setTimeout(() => {
                setAppearingTaskId(null)
            }, 400)
        })
    }, []);

    useEffect(() => {
        newTaskInputRef.current?.focus()

        taskAPI.getALL().then(setTasks)
    }, [])



    const filteredTasks = useMemo(() => {
        const clearSearchQuerry = searchQuery.trim().toLowerCase()

        return clearSearchQuerry.length > 0
        ? tasks.filter(({ title }) => title.toLowerCase().includes(clearSearchQuerry))
        : tasks
    }, [searchQuery, tasks]);

    return {
        tasks, 
        filteredTasks, 
        deleteTask, 
        deleteAllTasks,
        toggleTaskComplete,
        newTaskTitle,
        setNewTaskTitle,
        searchQuery,
        setSearchQuery,
        newTaskInputRef,
        AddTask,
        disappearingTaskId,
        appearingTaskId
    };
}

export default useTasks;