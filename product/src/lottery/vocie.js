"use strict";

let mediaRecorder;
let socket;

export async function startSpeechRecognition() {
  if(mediaRecorder){
    console.log('mediaRecorder.stop');
    socket.send('transform');
    mediaRecorder.stop();
    return;
  }

  try {
      if (!('MediaRecorder' in window)) {
          console.error('MediaRecorder is not supported in this browser.');
          return;
      }

      // 请求用户授权麦克风权限并获取音频流
      const audioConstraints = {
        audio: {
          sampleRate: 16000, // 设置采样率为16kHz
          channelCount: 1,   // 单声道
        }
      };

      const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      console.log('Audio stream acquired.');

      mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus', // 或者其他支持的类型
      });

      socket = new WebSocket('ws://localhost:8888');

      let audioChunks = [];

      // 监听错误事件
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      mediaRecorder.ondataavailable = event => {
          console.log('Data available event triggered');
          if (event.data.size > 0) {
              audioChunks.push(event.data);
              // 将 Blob 转换为 ArrayBuffer 并发送给 WebSocket
              event.data.arrayBuffer().then(buffer=>{
                socket.send(buffer);

            }).catch(error => {
                console.error('Error converting Blob to ArrayBuffer:', error);
            });
          }
      };

      mediaRecorder.onstop = () => {
          console.log('Recording stopped');
      };

      // 设置WebSocket事件监听器
      socket.onopen = () => {
          console.log('WebSocket connection established.');
          // 开始录制
          mediaRecorder.start(200); // 每秒一次数据块
          console.log('MediaRecorder started.');
      };

      socket.onerror = error => {
          console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
          console.log('WebSocket connection closed.');
      };

      socket.onmessage = message => {
          // 处理从服务器接收到的消息
          // console.log('Message from server:', message);
          const user_llm_msg = JSON.parse(message.data);
          mediaRecorder = null;
          // 关闭连接
          socket.close(1000, '用户主动关闭');
          // socket.removeEventListener('open');
          socket = null;
          let htmlCode = `<div style="text-align: center;color: gold; ><label id="voiceMessage" class="prize-shine">${user_llm_msg.userMsg}</label></div>`;
          document.querySelector("#voiceMessage").innerHTML = htmlCode;
          if (user_llm_msg.llmAns === 'lottery'){
            const lotteryButton = document.getElementById('lottery');
            lotteryButton.click();
          }else if(user_llm_msg.llmAns === 'relottery'){
            const lotteryButton = document.getElementById('reLottery');
            lotteryButton.click();
          }
      };

  } catch (err) {
      console.error('Error accessing media devices.', err);
  }
}

