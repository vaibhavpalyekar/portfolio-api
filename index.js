const express = require('express');

const app = express();
const cors = require('cors');
const moment = require('moment');
const helpers = require('./helpers/');

const corsOptions = {
  origin: '*', // here we can restrict the origin 
  methods: 'GET',
};

app.use(cors(corsOptions));


app.get('/portfolios', (req, res) => {
  try {
    const name = req.query.name ? req.query.name : '';
    const data = helpers.readJSONFile('./public/Portfolios/portfolios.json'); // read portfolio data from json
    if (data && data.Portfolios) {
      let portfolios = data.Portfolios;
      if (name !== '') {
        const pattern = new RegExp(name, 'i');

        // filter data by portfolio name
        portfolios = portfolios.filter(portfolio => pattern.test(portfolio.Name));
      }
      const portfolioArr = [];
      if (portfolios.length > 0) {
        portfolios.forEach((portfolio) => {
          const transactions = portfolio.Transactions ? portfolio.Transactions : [];
          const numberOfHoldings = transactions.length;

          // get last modified date
          let lastModified = transactions.reduce((m, v, i) => ((v.Date > m.Date) && i ? v : m));
          lastModified = lastModified.Date;

          const portfolioObj = {
            _Id: portfolio._Id,
            Name: portfolio.Name,
            NumberOfHoldings: numberOfHoldings,
            LastModified: lastModified,
          };

          portfolioArr.push(portfolioObj);
        });
      }
      res.json({
        data: {
          Portfolios: portfolioArr,
        },
      });
    } else {
      res.status(500).json({
        message: 'Portfolios are not defined.',
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get('/transactions/:portfolioId', (req, res) => {
  try {
    const selectedDate = req.query.date ? req.query.date : moment().format('YYYY-MM-DD');
    const { portfolioId } = req.params;
    const portfolioData = helpers.readJSONFile('./public/Portfolios/portfolios.json'); // read portfolio data from json

    const securityData = helpers.readJSONFile('./public/Securities/securities.json'); // read securities data from json

    if (portfolioData && portfolioData.Portfolios) { // check Portfolies data is exist
      if (securityData && securityData.Securities) { // check Securities data is exist
        const portfolios = portfolioData.Portfolios;
        const securities = securityData.Securities;

        // filter portfilo to get Info
        const findPortfolio = portfolios.filter(portfolio => portfolio._Id === portfolioId);

        if (findPortfolio.length > 0) {
          const portfolio = findPortfolio[0];
          const portfolioObj = {
            _Id: portfolio._Id,
            Name: portfolio.Name,
          };

          const transactions = portfolio.Transactions ? portfolio.Transactions : [];

          // get distinct securities list
          const distinctSecurities = [...new Set(transactions.map(elem => elem.SecurityId))];

          const portfolioList = [];
          let portfolioTotalValue = 0;

          distinctSecurities.forEach((securityId) => {
            // find transcation which date is less than selected date
            const securityTransactions = transactions.filter(elem => (elem.SecurityId === securityId && new Date(elem.Date) < new Date(selectedDate)));

            if (securityTransactions.length > 0) {
              const portfolioValueObj = {};
              portfolioValueObj.SecurityId = securityId;
              portfolioValueObj.Date = selectedDate;

              // filter securities
              const findSecurity = securities.filter(security => security._Id === securityId);

              if (findSecurity.length > 0) {
                const security = findSecurity[0];
                portfolioValueObj.Name = security.name;

                const historyDetail = security.HistoryDetail ? security.HistoryDetail : [];

                // get the price of selected date
                const selectedDatePrice = helpers.getPriceByDate(selectedDate, historyDetail);

                portfolioValueObj.Price = selectedDatePrice;

                const transcationList = [];
                let sharesTotal = 0;

                securityTransactions.forEach((transcation) => {
                  const transcationObj = {};
                  const transactionDate = transcation.Date;

                  transcationObj._Id = securityId;
                  transcationObj.Name = security.name;
                  transcationObj.Type = transcation.Type;
                  transcationObj.Date = transactionDate;


                  const price = helpers.getPriceByDate(transactionDate, historyDetail);

                  transcationObj.Price = price;
                  transcationObj.Amount = transcation.Amount;
                  const shares = transcation.Amount / price;
                  transcationObj.Shares = shares;

                  if (transcation.Type === 'Sell') { // if transcation type sale then minus shares from total shares
                    sharesTotal -= shares;
                  } else {
                    sharesTotal += shares;
                  }
                  transcationList.push(transcationObj);
                });

                const portfolioValue = sharesTotal * selectedDatePrice;
                portfolioTotalValue += portfolioValue;

                portfolioValueObj.Shares = sharesTotal;
                portfolioValueObj.Amount = portfolioValue;
                portfolioValueObj.Transactions = transcationList;
              }


              portfolioList.push(portfolioValueObj);
            }
          });

          portfolioObj.PortfolioList = portfolioList;
          portfolioObj.PortfolioTotalValue = portfolioTotalValue;

          res.json({
            data: {
              Portfolio: portfolioObj,
            },
          });
        } else {
          res.status(404).json({
            message: 'Portfolio not found.',
          });
        }
      } else {
        res.status(500).json({
          message: 'Securities are not defined.',
        });
      }
    } else {
      res.status(500).json({
        message: 'Portfolios are not defined.',
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});



app.listen(3000);

// Export app for testing purposes
module.exports= app;