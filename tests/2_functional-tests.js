const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('./api/stock-prices/ GET', function() {

    test("Viewing one stock", function(done) {
      chai
          .request(server)
          .get("/api/stock-prices/")
          .query({
            stock: "GOOG"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, "GOOG");
            done();
          });
      });


    test("Viewing one stock and liking it", function(done) {
      chai
          .request(server)
          .get("/api/stock-prices/")
          .query({
            stock: "GOLD",
            like: true
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, "GOLD");
            assert.equal(res.body.stockData.likes, 1);
            done();
          });
      });

    test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", function (done) {
      chai
          .request(server)
          .get("/api/stock-prices/")
          .query({
            stock: "GOLD",
            like: true
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, "GOLD");
            assert.equal(res.body.stockData.likes, 1);
            done();
          });
      });

    test("Viewing two stocks: GET request to /api/stock-prices/", function (done) {
      chai
          .request(server)
          .get("/api/stock-prices/")
          .query({
            stock: ["AMZN", "T"]
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "AMZN");
            assert.equal(res.body.stockData[1].stock, "T");
            done();
          });
      });

    test("Viewing two stocks and liking them: GET request to /api/stock-prices/", function (done) {
      chai
          .request(server)
          .get("/api/stock-prices/")
          .query({
            stock: ["AMZN", "T"],
            like: true
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "AMZN");
            assert.equal(res.body.stockData[1].stock, "T");
            assert.exists(res.body.stockData[0].rel_likes, "has rel_likes");
            assert.exists(res.body.stockData[1].rel_likes, "has rel_likes");
            done();
          });
      });

      
    
  });

});
