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
    count: 5,
    text: "一等奖",
    title: "Mac Pro",
    img: "../img/mbp.jpg"
  },
  {
    type: 2,
    count: 6,
    text: "二等奖",
    title: "华为 Mate30",
    img: "../img/huawei.png"
  },
  {
    type: 3,
    count: 7,
    text: "三等奖",
    title: "Ipad Mini5",
    img: "../img/ipad.jpg"
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
const EACH_COUNT = [0, 5, 6, 7];

/**
 * 卡片公司名称标识
 */
const COMPANY = "DBS Tech China";

module.exports = {
  prizes,
  EACH_COUNT,
  COMPANY
};
