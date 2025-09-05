import React, { useState, useEffect } from 'react';
import './TodoList.css';

function TodoList({ username, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // 加载任务列表
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    fetch('http://localhost:5000/api/tasks', {
      headers: {
        'Content-Type': 'application/json',
        'username': username,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.tasks) {
          setTasks(data.tasks);
        }
      })
      .catch((error) => {
        console.error('加载任务失败:', error);
      });
  };

  // 添加新任务
  const handleAddTask = () => {
    if (!newTask.trim()) return;

    fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        title: newTask,
        category: newTaskCategory || '未分类',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadTasks();
          setNewTask('');
          setNewTaskCategory('');
        }
      })
      .catch((error) => {
        console.error('添加任务失败:', error);
      });
  };

  // 更新任务状态
  const handleToggleComplete = (id, completed) => {
    fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !completed }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadTasks();
        }
      })
      .catch((error) => {
        console.error('更新任务状态失败:', error);
      });
  };

  // 删除任务
  const handleDeleteTask = (id) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            loadTasks();
          }
        })
        .catch((error) => {
          console.error('删除任务失败:', error);
        });
    }
  };

  // 开始编辑任务
  const handleStartEdit = (task) => {
    setEditingTask(task.id);
    setEditText(task.title);
    setEditCategory(task.category);
  };

  // 保存编辑的任务
  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;

    fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: editText, category: editCategory || '未分类' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadTasks();
          setEditingTask(null);
          setEditText('');
          setEditCategory('');
        }
      })
      .catch((error) => {
        console.error('更新任务失败:', error);
      });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditText('');
    setEditCategory('');
  };

  // 获取所有唯一的分类
  const getCategories = () => {
    const categories = ['all', ...new Set(tasks.map((task) => task.category))];
    return categories;
  };

  // 过滤任务
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = 
      filterStatus === 'all' || 
      (filterStatus === 'completed' && task.completed) || 
      (filterStatus === 'pending' && !task.completed);
    
    const categoryMatch = 
      filterCategory === 'all' || task.category === filterCategory;
    
    return statusMatch && categoryMatch;
  });

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>待办事项列表</h1>
        <div className="user-info">
          <span>欢迎，{username}！</span>
          <button className="btn-secondary" onClick={onLogout}>退出登录</button>
        </div>
      </div>

      <div className="add-task">
        <input
          type="text"
          placeholder="添加新任务..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <input
          type="text"
          placeholder="分类（可选）"
          value={newTaskCategory}
          onChange={(e) => setNewTaskCategory(e.target.value)}
        />
        <button className="btn-primary" onClick={handleAddTask}>添加任务</button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>状态过滤：</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="pending">未完成</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        <div className="filter-group">
          <label>分类过滤：</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {getCategories().map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? '全部' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">暂无任务</div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-item">
              {editingTask === task.id ? (
                <div className="task-edit">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                  />
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  />
                  <button className="btn-success" onClick={() => handleSaveEdit(task.id)}>保存</button>
                  <button className="btn-secondary" onClick={handleCancelEdit}>取消</button>
                </div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                  />
                  <div className={`task-content ${task.completed ? 'completed' : ''}`}>
                    <div className="task-title">{task.title}</div>
                    <div className="task-category">{task.category}</div>
                    <div className="task-time">{task.created_at}</div>
                  </div>
                  <div className="task-actions">
                    <button className="btn-secondary" onClick={() => handleStartEdit(task)}>编辑</button>
                    <button className="btn-danger" onClick={() => handleDeleteTask(task.id)}>删除</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList;