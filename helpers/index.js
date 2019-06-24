const fs = require('fs');

function getPriceByDate(date, historyDetail) {
  const findDate = historyDetail.filter(historyData => historyData.EndDate === date);
  let price = 0;
  if (findDate.length > 0) {
    price = findDate[0].Value;
  } else {
    const findDateLessThan = historyDetail.sort((a, b) => new Date(b.EndDate) - new Date(a.EndDate)).filter(val => new Date(val.EndDate) < new Date(date));
    if (findDateLessThan.length > 0) {
      price = findDateLessThan[0].Value;
    }
  }
  return price;
}

function readJSONFile(filePath) {
  const rawdata = fs.readFileSync(filePath);
  const data = JSON.parse(rawdata);
  return data;
}

module.exports = { getPriceByDate, readJSONFile };