// server.js

const http = require("http");
const https = require("https");
var url = require('url');
let timer;

 function getCoins(coin){
    return new Promise(function(resolve, reject) {
        https.get(
            `https://min-api.cryptocompare.com/data/price?fsym=${coin}&tsyms=USD,EUR`, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      res.resume();
      return;
    }
  
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try { 
        const parsedData = JSON.parse(rawData);
        //console.log(parsedData);
        resolve(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Received error: ${e.message}`);
  });
     });
} 

http
  .createServer((request, response) => {
    console.log("Requested url: " + request.url);
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query.coin
    console.log(query);
    if (request.url.toLowerCase().includes("/coins" )) {
        response.writeHead(200, {
            Connection: "keep-alive",
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*"
          });
        clearInterval(timer);
        timer = setInterval(() => {
            response.write("\n\n");
            getCoins(query).then(res => {
                response.write(`data: ${JSON.stringify(res)}`);
                response.write("\n\n");
                console.log('check');
                console.log(JSON.stringify(res));
        })
           
          }, 10000);

      response.on('close', () => {
    if (!response.finished) {
      console.log("CLOSED");
      clearInterval(timer);
      response.writeHead(404);
    }
  });

    } else {
      response.writeHead(404);
      response.end();
    }
  })
  .listen(5000, () => {
    console.log("Server running at http://127.0.0.1:5000/");
  });