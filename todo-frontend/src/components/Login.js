import React, { useState } from 'react';

function Login({ onLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 简单的前端验证
    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }

    // 模拟登录请求
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          onLogin(username);
        } else {
          setError(data.message || '登录失败，请检查用户名和密码');
        }
      })
      .catch((error) => {
        console.error('登录错误:', error);
        setError('登录失败，请稍后重试');
      });
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>用户登录</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" className="btn-primary">登录</button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onRegister}
        >
          没有账号？立即注册
        </button>
      </form>
    </div>
  );
}

export default Login;