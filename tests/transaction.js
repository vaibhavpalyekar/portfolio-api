import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

chai.use(chaiHttp);
chai.should();

describe("Transactions", () => {
    describe("GET /transactions", () => {

        // Test to get portfolio's transaction
        it("should get portfolio's transaction", (done) => {
            const id = 1;
            chai.request(app)
                .get(`/transactions/${id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.be.an('object');
                    
                    res.body.data.should.have.property('Portfolio');
                    res.body.data.Portfolio.should.be.an('object');
                    
                    res.body.data.Portfolio.should.have.property('PortfolioList');
                    res.body.data.Portfolio.PortfolioList.should.be.an('array');
                    
                    res.body.data.Portfolio.should.have.property('_Id');
                    res.body.data.Portfolio._Id.should.be.an('String');

                    res.body.data.Portfolio.should.have.property('Name');
                    res.body.data.Portfolio.Name.should.be.an('String');

                    res.body.data.Portfolio.should.have.property('PortfolioTotalValue');
                    res.body.data.Portfolio.PortfolioTotalValue.should.be.an('Number');



                    done();
                });
        });

        // Test to get portfolio's transaction
        it("should not get portfolio's transcation", (done) => {
            const id = 10;
            chai.request(app)
                .get(`/transactions/${id}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    done();
                });
        });
    });
});