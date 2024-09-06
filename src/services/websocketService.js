// 文件路径：/src/services/webSocketService.js
export const initiateWebSocketConnection = (password, onMessage, onOpen, onError, onClose) => {
  return new Promise((resolve, reject) => {
      const socket = new WebSocket(`ws://47.116.203.240:5000/chat?room=${password}`);

      // WebSocket 连接成功
      socket.onopen = () => {
          console.log('WebSocket connection established');
          if (onOpen) onOpen(socket); // 调用提供的回调函数
          resolve(socket); // 返回 WebSocket 实例
      };

      // WebSocket 错误处理
      socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (onError) onError(error); // 调用提供的回调函数
          reject(error); // 返回 Promise 失败
      };

      // 处理接收到的消息
      socket.onmessage = (message) => {
          console.log('Received message:', message.data);
          if (onMessage) onMessage(message.data); // 调用提供的回调函数
      };

      // WebSocket 连接关闭处理
      socket.onclose = (event) => {
          console.log('WebSocket connection closed');
          if (onClose) onClose(event); // 调用提供的回调函数
      };

      // 发送消息的方法
      socket.sendMessage = (message) => {
          if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(message));
          } else {
              console.error('WebSocket is not open. Cannot send message');
          }
      };

      // 发送文件的方法
      socket.sendFile = (file) => {
          if (socket.readyState === WebSocket.OPEN) {
              const reader = new FileReader();
              reader.onload = () => {
                  const fileData = {
                      type: 'file',
                      filename: file.name,
                      content: Array.from(new Uint8Array(reader.result)) // 转换为 Array
                  };
                  socket.send(JSON.stringify(fileData));
              };
              reader.readAsArrayBuffer(file); // 读取文件为 ArrayBuffer
          } else {
              console.error('WebSocket is not open. Cannot send file.');
          }
      };

      return { socket };
  });
};
