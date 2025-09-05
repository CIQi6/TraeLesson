from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import datetime
import os

app = Flask(__name__)
CORS(app)

DATABASE = 'database.db'

# 初始化数据库
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        # 创建用户表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # 创建任务表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                category TEXT DEFAULT '未分类',
                completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        conn.commit()

# 辅助函数：获取数据库连接
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # 使返回的结果可以通过列名访问
    return conn

# 用户注册路由
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'})
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': '密码长度至少为6位'})
    
    # 密码加密
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '注册成功'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': '用户名已存在'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': '注册失败，请稍后重试'})

# 用户登录路由
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'})
    
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, hashed_password))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({'success': True, 'user_id': user['id'], 'username': user['username']})
        else:
            return jsonify({'success': False, 'message': '用户名或密码错误'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': '登录失败，请稍后重试'})

# 获取当前用户ID
def get_user_id(username):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    return user['id'] if user else None

# 获取任务列表
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    username = request.headers.get('username')
    if not username:
        return jsonify({'success': False, 'message': '未登录'})
    
    user_id = get_user_id(username)
    if not user_id:
        return jsonify({'success': False, 'message': '用户不存在'})
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
        tasks = cursor.fetchall()
        conn.close()
        
        task_list = []
        for task in tasks:
            task_list.append({
                'id': task['id'],
                'title': task['title'],
                'category': task['category'],
                'completed': bool(task['completed']),
                'created_at': task['created_at']
            })
        
        return jsonify({'success': True, 'tasks': task_list})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': '获取任务列表失败'})

# 添加新任务
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    username = data.get('username')
    title = data.get('title')
    category = data.get('category', '未分类')
    
    if not username or not title:
        return jsonify({'success': False, 'message': '参数不完整'})
    
    user_id = get_user_id(username)
    if not user_id:
        return jsonify({'success': False, 'message': '用户不存在'})
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO tasks (user_id, title, category) VALUES (?, ?, ?)', (user_id, title, category))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '任务添加成功'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': '任务添加失败'})

# 更新任务
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # 检查任务是否存在
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        
        if not task:
            conn.close()
            return jsonify({'success': False, 'message': '任务不存在'})
        
        # 准备更新字段
        update_fields = []
        update_values = []
        
        if 'title' in data:
            update_fields.append('title = ?')
            update_values.append(data['title'])
        
        if 'category' in data:
            update_fields.append('category = ?')
            update_values.append(data['category'])
        
        if 'completed' in data:
            update_fields.append('completed = ?')
            update_values.append(1 if data['completed'] else 0)
        
        if not update_fields:
            conn.close()
            return jsonify({'success': False, 'message': '没有需要更新的字段'})
        
        # 执行更新
        update_query = 'UPDATE tasks SET ' + ', '.join(update_fields) + ' WHERE id = ?'
        update_values.append(task_id)
        
        cursor.execute(update_query, tuple(update_values))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '任务更新成功'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': '任务更新失败'})

# 删除任务
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # 检查任务是否存在
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        
        if not task:
            conn.close()
            return jsonify({'success': False, 'message': '任务不存在'})
        
        # 执行删除
        cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '任务删除成功'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': '任务删除失败'})

if __name__ == '__main__':
    # 初始化数据库
    if not os.path.exists(DATABASE):
        init_db()
    # 启动应用
    app.run(debug=True)