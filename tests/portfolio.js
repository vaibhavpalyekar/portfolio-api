import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

chai.use(chaiHttp);
chai.should();

describe("Portfolio", () => {
    describe("GET /portfolios", () => {
        // Test to get portfolio list
        it("should get portfolio list", (done) => {
            chai.request(app)
                .get('/portfolios')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.be.an('object');
                    res.body.data.should.have.property('Portfolios');
                    res.body.data.Portfolios.should.be.an('array');


                    done();
                });
        });

    });
});


