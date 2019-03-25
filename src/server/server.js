// server.js

const http = require("http");
const https = require("https");




async function getCoins(){
    return new Promise(function(resolve, reject) {

    https.get('https://www.cryptocompare.com/api/data/coinlist/', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
    console.log(res)
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
      // Consume response data to free up memory
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
    console.error(`Got error: ${e.message}`);
  });
        });
        // on request error, reject
        // if there's post data, write it to the request
        // important: end the request req.end()

} 

http
  .createServer((request, response) => {
    console.log("Requested url: " + request.url);
    if (request.url.toLowerCase() === "/events") {
        response.writeHead(200, {
            Connection: "keep-alive",
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*"
          });

        setTimeout(() => {
            const coins = getCoins().then(res => {
                response.write(`data: ${JSON.stringify(res)}`);
                response.write("\n\n");
        })
           
          }, 3000);
     

    } else {
      response.writeHead(404);
      response.end();
    }
  })
  .listen(5000, () => {
    console.log("Server running at http://127.0.0.1:5000/");
  });