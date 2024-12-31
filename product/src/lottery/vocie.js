"use strict";
import getWaveBlob from "./wavBlobUtil";
let mediaRecorder;
let socket;

//const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

let audioChunks = [], 
    h_index = 0,
    t_index = 1;

let displayMsg = '';

// 定义音频上下文选项
const audioContextOptions = {
  channelCount: 1,  // 单声道
  sampleRate: 16000 // 设置采样率为 16 kHz
};


async function prepareMediaRecorder(socket) {
  try {
    // 请求用户授权麦克风权限并获取音频流
    const audioConstraints = {
      audio: audioContextOptions
    };

    // 获取音频流
    const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    console.log('Audio stream acquired.');

    //clean up previous voice buffer
    audioChunks = [];
    h_index = 0;
    t_index = 1;

    // 创建一个新的 MediaRecorder 实例
    const mediaRecorder = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm;codecs=opus', // 或者其他支持的类型
    });

    // 监听错误事件
    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };

    mediaRecorder.ondataavailable = event => {
        //console.log('Data available event triggered');
        if (event.data.size > 0) {
            console.log(event.data.size)
            audioChunks.push(event.data);
            getWaveBlob(audioChunks, false, audioContextOptions)
            .then(blob => {
              // 将 Blob 转换为 ArrayBuffer
              return new Response(blob).arrayBuffer();
            })
            .then(async arrayBuffer => {
              // 发送 ArrayBuffer 通过 WebSocket
              console.log("Sending audio chunk to backend");
              t_index = arrayBuffer.byteLength;

              const chunk = arrayBuffer.slice(h_index, t_index);
              socket.send(chunk);
              h_index = t_index;

              //console.log("Finish sending audio chunk to backend");                
            })
            .catch(error => {
              console.error('Error converting Blob to ArrayBuffer or sending:', error);
            });
        }
    };

    mediaRecorder.onstop = () => {
        console.log('Recording stopped');
    };
    
    // 返回 mediaRecorder 对象，以便外部可以控制它（如停止录音）
    return mediaRecorder;
  } catch (error) {
    console.error('Error accessing media devices.', error);
  }
}

export async function startSpeechRecognition() {
  if(mediaRecorder){
    console.log('mediaRecorder.stop');
    //stop recorder.
    mediaRecorder.stop();
    socket.send('transform');
    mediaRecorder = null;

    let htmlCode = `<div>${displayMsg}</div>`;
    document.querySelector("#voiceMessage").innerHTML = htmlCode;
    // 关闭连接
    socket.close(1000, '用户主动关闭');
    socket = null;
    return;
  }

  try {
      if (!('MediaRecorder' in window)) {
          console.error('MediaRecorder is not supported in this browser.');
          return;
      }
      //start the websocket
      socket = new WebSocket('ws://localhost:8888');

      mediaRecorder = await prepareMediaRecorder(socket)

      // 开始录制
      mediaRecorder.start(200); // 每秒一次数据块
      
      console.log('MediaRecorder started.');
      let htmlCode =`<div style="display: flex; align-items: center;><span"></span><img src="../img/voice_reg.gif" alt="Voice Registration GIF" class="voice-reg-img" /></div>`;
      
      document.querySelector("#voiceMessage").innerHTML = htmlCode;

      // 设置WebSocket事件监听器
      socket.onopen = () => {
          console.log('WebSocket connection established.');
      };

      socket.onerror = error => {
          console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
          console.log('WebSocket connection closed.');
      };

      socket.onmessage = async message => {
          // 处理从服务器接收到的消息
          // console.log('Message from server:', message);
          const user_llm_msg = JSON.parse(message.data);
          console.log(user_llm_msg.userMsg, 'test')
          if (user_llm_msg.userMsg === ''){
            console.log(user_llm_msg.userMsg, 'isnide')
            displayMsg  = 'System: Invalid voice, please speak out your request again.';
          }
          else{
            displayMsg = 'User: ' + user_llm_msg.userMsg + '<br>' + 'System: ' + user_llm_msg.llmAns;
          }
          mediaRecorder.stop();
          mediaRecorder = null;

          let htmlCode = `<div style="display: flex; align-items: center; justify-content: center; background: url('../img/voice_reg.gif') no-repeat center center / 100% auto; width: 30vw;">
          <span>${displayMsg}</span>
        </div>`
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

          mediaRecorder = await prepareMediaRecorder(socket);

          mediaRecorder.start(200);
      };

  } catch (err) {
      console.error('Error accessing media devices.', err);
  }
}

