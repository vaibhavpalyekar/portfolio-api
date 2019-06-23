
function getPriceByDate(date, historyDetail) {
    const findDate = historyDetail.filter(historyData => historyData.EndDate == date);
    let price = 0;
    if (findDate.length > 0) {
        price = findDate[0].Value;
    } else {
        const findDateLessThan = historyDetail.sort(function(a, b) {
            return new Date(b.EndDate) - new Date(a.EndDate)
        }).filter((val) => {
            return new Date(val.EndDate) < new Date(date);
        });
        if (findDateLessThan.length > 0) {
            price = findDateLessThan[0].Value;
        }
    }
    return price;
}

module.exports={getPriceByDate}