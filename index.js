const express = require('express')
const app = express()
const fs = require('fs')
const cors = require('cors')
const helpers=require('./helpers/')
const moment = require('moment')

const corsOptions = {
    origin: '*',
    methods: "GET"
}

app.use(cors(corsOptions));


app.get('/portfolios', (req, res) => {
    try {
        const name = req.query.name ? req.query.name : '';
        let rawdata = fs.readFileSync('./public/Portfolios/portfolios.json');
        let data = JSON.parse(rawdata);
        if (data && data.Portfolios) {
            let portfolios = data.Portfolios;
            if (name != '') {
                const pattern = new RegExp(name, "i");

                portfolios = portfolios.filter(portfolio => pattern.test(portfolio.Name));
            }
            const portfolioArr = [];
            if (portfolios.length > 0) {
                portfolios.forEach((portfolio) => {
                    let transactions = portfolio.Transactions ? portfolio.Transactions : [];
                    let numberOfHoldings = transactions.length;
                    let lastModified = transactions.reduce((m, v, i) => (v.Date > m.Date) && i ? v : m).Date
                    let portfolioObj = {
                        _Id: portfolio._Id,
                        Name: portfolio.Name,
                        NumberOfHoldings: numberOfHoldings,
                        LastModified: lastModified
                    }
                    portfolioArr.push(portfolioObj);
                });

            }
            res.json({
                data: {
                    Portfolios: portfolioArr
                }
            });
        } else {
            res.status(500).json({
                message: "Portfolios are not defined."
            })
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }

})

app.get('/transactions/:portfolioId', (req, res) => {
    try {
const selectedDate=req.query.date?req.query.date:moment().format('YYYY-MM-DD');
console.log("selectedDate",selectedDate);
        const portfolioId = req.params.portfolioId;
        let portfolioRawdata = fs.readFileSync('./public/Portfolios/portfolios.json');
        let portfolioData = JSON.parse(portfolioRawdata);

        let securityRawdata = fs.readFileSync('./public/Securities/securities.json');
        let securityData = JSON.parse(securityRawdata);

        if (portfolioData && portfolioData.Portfolios) {
            if (securityData && securityData.Securities) {

                let portfolios = portfolioData.Portfolios;
                let securities = securityData.Securities;
                let findPortfolio = portfolios.filter(portfolio => portfolio._Id == portfolioId)
                if (findPortfolio.length > 0) {
                    const portfolio = findPortfolio[0];
                    const portfolioObj = {
                        _Id: portfolio._Id,
                        Name: portfolio.Name
                    };
                    let transactions = portfolio.Transactions ? portfolio.Transactions : [];
                    console.log("transactions", transactions);
                    const transcationList = [];

                    transactions.forEach((transcation) => {

                        const securityId = transcation.SecurityId;
                        const transactionDate = transcation.Date;
                        const findSecurity = securities.filter(security => security._Id == securityId)
                        if (findSecurity.length > 0) {
                            security = findSecurity[0];

                            console.log("securityId", securityId);
                            console.log("findSecurity", security.name);
                            console.log("transactionDate", transactionDate);
                            const historyDetail = security.HistoryDetail ? security.HistoryDetail : [];
                            const price = helpers.getPriceByDate(transactionDate, historyDetail);
                            transcation.Name=security.name;
                            transcation.Date=selectedDate;
                            transcation.Price = price;
                            transcation.Shares = transcation.Amount / price;
                        }

                    });
                    res.json({
                        data: {
                            Portfolio: portfolio
                        }
                    });

                } else {
                    res.status(500).json({
                        message: "Portfolio not found."
                    })
                }
            } else {
                res.status(500).json({
                    message: "Securities are not defined."
                })
            }
        } else {
            res.status(500).json({
                message: "Portfolios are not defined."
            })
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }

})

app.listen(3000)
