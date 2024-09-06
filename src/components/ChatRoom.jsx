import React, { useState, useEffect, useRef } from 'react';
import { initiateWebSocketConnection } from '../services/websocketService.js';
import '../styles/ChatRoom.css'; // 你可以定义样式

const ChatRoom = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const sendMessageRef = useRef(() => {}); // 默认空函数
    const sendFileRef = useRef(() => {}); // 默认空函数

    useEffect(() => {
        const password = JSON.parse(localStorage.getItem('encryptedPassword'));

        initiateWebSocketConnection(
            password,
            (data) => {
                if (data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            const parsedMessage = JSON.parse(reader.result);
                            if (parsedMessage.type === 'file') {
                                const blob = new Blob([new Uint8Array(parsedMessage.content)], { type: 'application/octet-stream' });
                                const url = URL.createObjectURL(blob);
                                setMessages((prevMessages) => [
                                    ...prevMessages,
                                    { url, filename: parsedMessage.filename }
                                ]);
                                //if (parsedMessage.type === 'text')
                            } else {
                                setMessages((prevMessages) => [...prevMessages, parsedMessage.content]);
                            }
                        } catch (error) {
                            console.error('Failed to parse message:', error);
                        }
                    };
                    reader.readAsText(data); // 读取 Blob 数据为文本
                } else {
                    console.error('Unexpected message format');
                }
            },
            (socket) => {
                socketRef.current = socket;
                sendMessageRef.current = (message) => {
                    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        socketRef.current.sendMessage(message);
                    } else {
                        console.error('WebSocket is not open. Cannot send message.');
                    }
                };

                sendFileRef.current = (file) => {
                    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        socketRef.current.sendFile(file); // 使用持久化的 sendFile 函数
                    } else {
                        console.error('WebSocket is not open. Cannot send file.');
                    }
                };
            },
            (error) => {
                console.error('WebSocket error:', error);
            },
            () => {
                console.log('WebSocket connection closed');
            }
        );

        // Clean up on component unmount
        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    const handleSendMessage = () => {
        if (message.trim() && sendMessageRef.current) {
            sendMessageRef.current({ type: 'text', content: message }); // 发送消息类型和内容
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (sendFileRef.current && file) {
            sendFileRef.current(file); // 使用持久化的 sendFile 函数
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (sendFileRef.current && file) {
            sendFileRef.current(file); // 使用持久化的 sendFile 函数
        }
    };

    return (
        <div className="chatroom-container">
            <div className="message-display">
                {messages.map((msg, index) => (
                    <div key={index}>
                        {typeof msg === 'string' ? msg : <a href={msg.url} download={msg.filename}>{msg.filename}</a>}
                    </div>
                ))}
            </div>
            <div className="message-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                />
                <button onClick={handleSendMessage}>Send</button>
                <input type='file' onChange={handleFileChange}/>
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className='drop-zone'>
                    Drop files here
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
