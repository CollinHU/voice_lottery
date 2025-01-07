/**
 * 奖品设置
 * type: 唯一标识，0是默认特别奖的占位符，其它奖品不可使用
 * count: 奖品数量
 * title: 奖品描述
 * text: 奖品标题
 * img: 图片地址
 */
const prizes = [
  { 
    type: 0,
    count: 0,
    title: "",
    text: "抽奖结束"
  },
  {
    type: 1,
    count: 1,
    text: "一等奖",
    title: "AirePods 4",
    img: "../img/AirPods4.jpg"
  },
  {
    type: 2,
    count: 3,
    text: "二等奖",
    title: "JD ¥500 Voucher",
    img: "../img/JdVoucher.jpg"
  },
  {
    type: 3,
    count: 3,
    text: "三等奖A",
    title: "SONY SRS-XB100 Sound Box",
    img: "../img/SonySoundBox.jpg"
  },
  {
    type: 4,
    count: 3,
    text: "三等奖B",
    title: "Razer Mouse V3",
    img: "../img/razerMouse.jpg"
  },
  /*{
    type: 5,
    count: 8,
    text: "四等奖",
    title: "大疆无人机",
    img: "../img/spark.jpg"
  },
  {
    type: 6,
    count: 8,
    text: "五等奖",
    title: "Kindle",
    img: "../img/kindle.jpg"
  },
  {
    type: 7,
    count: 11,
    text: "六等奖",
    title: "漫步者蓝牙耳机",
    img: "../img/edifier.jpg"
  }*/
];

/**
 * 一次抽取的奖品个数与prizes对应
 */
const EACH_COUNT = [0, 1, 1, 1, 1];

/**
 * 卡片公司名称标识
 */
const COMPANY = "DBS Tech China";

module.exports = {
  prizes,
  EACH_COUNT,
  COMPANY
};
