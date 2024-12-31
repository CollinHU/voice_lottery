"use strict";
import getWaveBlob from "./wavBlobUtil";
let mediaRecorder;
let socket;

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

let audioChunks = []
// 定义音频上下文选项
const audioContextOptions = {
  channelCount: 1,  // 单声道
  sampleRate: 16000 // 设置采样率为 16 kHz
};

async function prepareMediaRecorder() {
  try {
    // 请求用户授权麦克风权限并获取音频流
    const audioConstraints = {
      audio: audioContextOptions
    };

    //clean up previous voice buffer
    audioChunks = [];

    // 获取音频流
    const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    console.log('Audio stream acquired.');

    // 创建一个新的 MediaRecorder 实例
    const mediaRecorder = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm;codecs=opus', // 或者其他支持的类型
    });
    // 返回 mediaRecorder 对象，以便外部可以控制它（如停止录音）
    return mediaRecorder;
  } catch (error) {
    console.error('Error accessing media devices.', error);
  }
}

export async function startSpeechRecognition() {
  if(mediaRecorder){
    console.log('mediaRecorder.stop');
    mediaRecorder.stop();
    return;
  }

  try {
      if (!('MediaRecorder' in window)) {
          console.error('MediaRecorder is not supported in this browser.');
          return;
      }

      /*const audioContextOptions = {
        channelCount: 1,  // 声道
        sampleRate: 16000 // 设置采样率为 16 kHz
      };

      // 请求用户授权麦克风权限并获取音频流
      const audioConstraints = {
        audio: audioContextOptions
      };

      const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      console.log('Audio stream acquired.');

      mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus', // 或者其他支持的类型
      });

      let audioChunks = [];*/
      mediaRecorder = await prepareMediaRecorder()

      //start the websocket
      socket = new WebSocket('ws://localhost:8888');

      // 监听错误事件
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      mediaRecorder.ondataavailable = event => {
          //console.log('Data available event triggered');
          if (event.data.size > 0) {
              audioChunks.push(event.data);
          }
      };

      mediaRecorder.onstop = () => {
          console.log('Recording stopped');
          getWaveBlob(audioChunks, false, audioContextOptions)
                .then(blob => {
                  // 将 Blob 转换为 ArrayBuffer
                  return new Response(blob).arrayBuffer();
                })
                .then(async arrayBuffer => {
                  // 发送 ArrayBuffer 通过 WebSocket
                  console.log("Start Sending audio chunk to backend");
                  let offset = 0;
                  let chunkSize = 7680;
                  while (offset < arrayBuffer.byteLength) {
                    const chunk = arrayBuffer.slice(offset, Math.min(offset + chunkSize, arrayBuffer.byteLength));
                    socket.send(chunk);
                    offset += chunkSize;
                    // 添加延迟
                    await sleep(10);
                  }
                  console.log("Finish sending audio chunk to backend");
                  socket.send('transform');                
                })
                .catch(error => {
                  console.error('Error converting Blob to ArrayBuffer or sending:', error);
                });
      };

      // 设置WebSocket事件监听器
      socket.onopen = () => {
          console.log('WebSocket connection established.');
          // 开始录制
          mediaRecorder.start(200); // 每秒一次数据块
          console.log('MediaRecorder started.');
          let htmlCode = `<div>
                          <label id="voiceMessage" class="prize-shine">
                          <img src="../img/voice_reg.gif" alt="Voice Registration GIF" class="voice-reg-img" />
                          </label>
                          </div>`;
          document.querySelector("#voiceMessage").innerHTML = htmlCode;
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
          if (user_llm_msg.userMsg === ''){
            user_llm_msg.userMsg = 'System: Invalid voice, please speak out your request again.';
          }
          else{
            user_llm_msg.userMsg = 'User: ' + user_llm_msg.userMsg + '<br>' + 'System: ' + user_llm_msg.llmAns;
          }
          mediaRecorder = null;
          // 关闭连接
          socket.close(1000, '用户主动关闭');
          // socket.removeEventListener('open');
          socket = null;
          let htmlCode = `<div>${user_llm_msg.userMsg}</div>`;
          document.querySelector("#voiceMessage").innerHTML = htmlCode;
          if (user_llm_msg.llmAns === 'lottery'){
            const lotteryButton = document.getElementById('lottery');
            lotteryButton.click();
          }else if(user_llm_msg.llmAns === 'relottery'){
            const lotteryButton = document.getElementById('reLottery');
            lotteryButton.click();
          }else if(user_llm_msg.llmAns === 'stop lottery'){
            const lotteryButton = document.getElementById('stopLottery');
            lotteryButton.click();
          }
      };

  } catch (err) {
      console.error('Error accessing media devices.', err);
  }
}

