const https = require('https')

const inventory_api_key = process.env.inventory_api_key;
const product_api_key = process.env.product_api_key;
const customer_api_key = process.env.customer_api_key;

var inventory_options = {
  host: "test1",
  headers: {
    "x-api-key": inventory_api_key
  }
}

var product_options = {
  host: "test2",
  headers: {
    "x-api-key": product_api_key
  }
}

var customer_options = {
  host: "test",
  headers: {
    "x-api-key": customer_api_key
  }
}

exports.handler = async function(event) {
  const promise = new Promise(function(resolve, reject) {
    https.get(options, url, (res) => {
        resolve(res.statusCode)
      }).on('error', (e) => {
        reject(Error(e))
      })
    })
  return promise
}