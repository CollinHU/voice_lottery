const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Nls = require("alibabacloud-nls");
const { error } = require("console");
const URL = "wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1";
const APPKEY = process.env.voiceRegApp; //获取Appkey请前往控制台：https://nls-portal.console.aliyun.com/applist

var RPCClient = require('@alicloud/pop-core').RPCClient;

var client = new RPCClient({
  accessKeyId: process.env.ALIYUN_AK_ID,
  accessKeySecret: process.env.ALIYUN_AK_SECRET,
  endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com',
  apiVersion: '2019-02-28'
});

// => returns Promise
// => request(Action, params, options)
let TOKEN = '';
client.request('CreateToken').then((result) => {
    TOKEN = result.Token.Id;
    console.log("Voice Reg Token expireTime = " + result.Token.ExpireTime);
}).catch(error => {
  console.error('Error in retrieving Voice Recg Token', error);
});


//const TOKEN = process.env.voiceRegToken;   //获取Token具体操作，请参见：https://help.aliyun.com/document_detail/450514.html

class Voice{
  successCallback;
  isWebSocketReady = false;
  st;
  sentences='';
  currentSentence='';

  setupEventHandlers=()=> {
    this.st.on("started", msg => {
      console.log("Client recv started:", msg);
      this.isWebSocketReady = true; // WebSocket 已经准备好接收数据
    });
  
    this.st.on("changed", msg => {
      const jsonObject = JSON.parse(msg);
      this.currentSentence=jsonObject.payload.result;
      console.log("Client recv changed:", jsonObject.payload.result);
    });
  
    this.st.on("completed", msg => {
      console.log("Client recv completed:", msg);
      this.successCallback && this.successCallback(this.sentences);
    });
  
    this.st.on("closed", () => {
      console.log("Client recv closed");
      this.isWebSocketReady = false;
    });
  
    this.st.on("failed", msg => console.log("Client recv failed:", msg));
    this.st.on("begin", msg => console.log("Client recv begin:", msg));
    this.st.on("end", msg => {
      const jsonObject = JSON.parse(msg);
      console.log("Client recv end:",jsonObject.payload.result);
      this.currentSentence=jsonObject.payload.result;
      this.sentences = this.sentences + this.currentSentence;
      this.currentSentence ='';
    });
  }
  
  init = async () => {
    this.st = new Nls.SpeechTranscription({
      url: URL,
      appkey: APPKEY,
      token: TOKEN
    });
    this.setupEventHandlers();
  
    try {
      await this.st.start(this.st.defaultStartParams(), true, 6000);
    } catch (error) {
      console.log("error on start:", error);
      return;
    }
  }  

  constructor(successCallback){
    this.successCallback = successCallback;
    this.init();
  }
}

module.exports = Voice;