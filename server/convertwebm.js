// audioConverter.js

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * 将WEBM文件转换为16kHz PCM WAV文件。
 *
 * @param {string} inputFilePath - 输入WEBM文件的路径。
 * @param {string} outputFilePath - 输出WAV文件的路径。
 * @returns {Promise<string>} - 返回一个包含输出文件路径的Promise。
 */
function convertWebmTo16kPcmWav(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    // 检查输入文件是否存在
    if (!fs.existsSync(inputFilePath)) {
      return reject(new Error('输入文件不存在'));
    }

    // 使用fluent-ffmpeg进行转换
    ffmpeg(inputFilePath)
      .audioFrequency(16000) // 设置采样率为16kHz
      .outputOptions([
        '-acodec pcm_s16le', // 设置音频编码器为PCM 16位小端
        '-ar 16000'          // 再次确认采样率为16kHz
      ])
      .output(outputFilePath)
      .on('end', () => {
        console.log('转换完成');
        resolve(outputFilePath);
      })
      .on('error', (err) => {
        console.error('转换出错:', err.message);
        reject(err);
      })
      .run();
  });
}

module.exports = {
  convertWebmTo16kPcmWav, // 导出函数
};