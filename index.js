const https = require('https')
let url = "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"

const inventory_api_key = process.env.inventory_api_key;
const product_api_key = process.env.product_api_key;
const customer_api_key = process.env.customer_api_key;


exports.handler = async function(event) {
  const promise = new Promise(function(resolve, reject) {
    https.get(url, (res) => {
        resolve(res.statusCode)
      }).on('error', (e) => {
        reject(Error(e))
      })
    })
  return promise
}