
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/api/tasks/${id}`);
        const data = res.data.task;

        setTask({
          title: data.title || "",
          description: data.description || "",
          assignedTo: data.assignedTo || "",
          priority: data.priority || "Medium",
          status: data.status || "Pending",
          dueDate: data.dueDate
            ? data.dueDate.substring(0, 10)
            : "",
        });
      } catch (err) {
        alert(err.response?.data?.message || "Unable to load task");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });
  };

  const updateTask = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/tasks/${id}`, task);

      alert("Task Updated Successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Update Failed");
    }
  };

  if (loading) return <h2>Loading Task...</h2>;

  return (
    <div style={{ width: "400px", margin: "50px auto" }}>
      <h1>Edit Task</h1>

      <form onSubmit={updateTask}>
        <input
          name="title"
          placeholder="Title"
          value={task.title}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="description"
          placeholder="Description"
          value={task.description}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="assignedTo"
          placeholder="Assigned To"
          value={task.assignedTo}
          onChange={handleChange}
        />
        <br /><br />

        <select
          name="priority"
          value={task.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <br /><br />

        <select
          name="status"
          value={task.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <br /><br />

        <input
          type="date"
          name="dueDate"
          value={task.dueDate}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Update Task</button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
