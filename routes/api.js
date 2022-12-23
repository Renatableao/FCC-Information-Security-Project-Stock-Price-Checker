'use strict';
const StockModel = require('../models').Stock;
const fetch = require("node-fetch")


async function saveStock(symbol, like, IP) { 
    let saved = {}
    
    const findstock = await StockModel.findOne({ symbol: symbol }).exec();

    // if can't find stock in database, add it
    if (!findstock) {
        const newstock = new StockModel({
          symbol: symbol,
          likes: like ? [IP] : [],
        })
        saved = newstock.save() 
        return saved
      }
      // if stock is in database
    else {
      //if like box is checked
      if (like && !findstock.likes.includes(IP)) {
        //include ip in database and save
        findstock.likes.push(IP); 
      }
      saved = findstock.save()
      return saved
    }
}


async function getStock(stock){
    const response = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/' + stock +'/quote');
    var { symbol, latestPrice } = await response.json();
    return { symbol, latestPrice }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const stock = req.query.stock
      const like = req.query.like === 'true'
      const IP = req.ip

      // Compare and get relative likes
      if (Array.isArray(stock)) {
  
        const { symbol, latestPrice } = await getStock(stock[0]);
        const { symbol: symbol2, latestPrice: latestPrice2 } = await getStock(stock[1]);  

        // find or save in database
        const stock_one = await saveStock(symbol, like, IP)
        const stock_two = await saveStock(symbol2, like, IP)
        let stockData = [];

        //if not valid symbols
        if (!symbol) {
          stockData.push({rel_likes: like ? 1 - stock_two.likes.length : 0 - stock_two.likes.length})
      }
        else if (!symbol2) {
          stockData.push({rel_likes: like ? 1 - stock_one.likes.length : 0 - stock_one.likes.length})
      }
        // if valid, display result
        else { 
          stockData.push(
            {stock: symbol, price: latestPrice, rel_likes: stock_one.likes.length - stock_two.likes.length}, 
            {stock: symbol2, price: latestPrice2, rel_likes: stock_two.likes.length - stock_one.likes.length})
          return res.json({stockData: stockData})
      }
    }

      // Get single price and total likes
      const { symbol, latestPrice } = await getStock(stock) 

      //if not valid
      if (!symbol) {
        res.json({ stockData: {likes: like ? 1: 0}});
        return
      }
      else {
        //find or save in database
        const stock = await saveStock(symbol, like, IP)
            //display result
          return res.json({stockData: {"stock": symbol, "price": latestPrice, "likes": stock.likes.length}})  
      } 
    }); 
};
