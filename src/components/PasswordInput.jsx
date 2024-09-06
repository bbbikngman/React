import React, {useState} from 'react';
import '../styles/PasswordInput.css';
import { useNavigate } from 'react-router-dom'; // 修改为 useNavigate
import EncryptionService from '../services/encryptionService.js';
import {initiateWebSocketConnection} from '../services/websocketService.js'

const PasswordInput = () => {
    const [password, setPassword] = useState(''); // 保存用户输入的密码
    const navigate  = useNavigate();

    // 处理密码连续变化
    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    // 提交密码，跳转到聊天界面
    const handleSubmit = () => {
        if(password.trim() === '') {
            alert('请输入密码');
            return;
        }
    
    // 创建加密服务实例
    const encryptionService = new EncryptionService(password);
    const encryptedPassword = encryptionService.encrypt(password);

    localStorage.setItem('encryptedPassword', JSON.stringify(encryptedPassword));

    // 调用websocket服务进行连接
    initiateWebSocketConnection(encryptedPassword )
        .then(() => {
            //WebSocket连接成功后跳转到聊天室
            navigate('/chat');
        })
        .catch(() => {
            alert('连接失败,请重试');
        });
    };
    return (
        <div className="password-input-container">
            <h2>请输入房间号（密码）</h2>
            <input
              type="password"
              placeholder='请输入房间号'
              value={password}
              onChange={handlePasswordChange}
              className='password-input-field'
            />
             <button onClick={handleSubmit} className='submit-button'>
                提交
             </button>
        </div>
    );
};

export default PasswordInput;