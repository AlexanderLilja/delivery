// ---------------------------------------------------------------
//    MODULES
// ---------------------------------------------------------------

const https = require('https');
const aws = require('aws-sdk');
const ses = new aws.SES({region: 'eu-west-1'});

// ---------------------------------------------------------------
//    API KEYS
// ---------------------------------------------------------------

const inventory_api_key = process.env.inventory_api_key; // INVENTORY API KEY
const product_api_key = process.env.product_api_key; // PRODUCT API KEY
const customer_api_key = process.env.customer_api_key; // CUSTOMER API KEY

// ---------------------------------------------------------------
//    VARIABLES
// ---------------------------------------------------------------

// ARRAYS
var product_data; // PRODUCT RESPONSE DATA
var customer_data; // CUSTOMER RESPONSE DATA
var inventory_data; // INVENTORY RESPONSE DATA

var email_order = ""; // BUILDS THE EMAIL BODY LATER ON

// INPUT VARIABLES
var user;
var order;

// ---------------------------------------------------------------
//    FUNCTIONS
// ---------------------------------------------------------------

// ---------------------------------------------------------------
//      EXTERNAL API CALL FUNCTIONS
// ---------------------------------------------------------------

// ---------------------------------------------------------------
//  CUSTOMER GET
// ---------------------------------------------------------------

function getCustomerData(id){
  
  var customer_id = id;
  
  var customer_options = {
    host: "7hxuxvgjn2.execute-api.eu-central-1.amazonaws.com",
    path: "/dev/customer/"+ customer_id ,
    headers: {
      "x-api-key": customer_api_key,
      "Access-Control-Allow-Origin": '*'
    }
  }
  
  // RETURNS PROMISE WITH DATA
  return new Promise(function(resolve, reject) {
    https.get(customer_options, function(res){
      // REJECT ON BAD STATUS
      if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('statusCode=' + res.statusCode));
      }
      // CUMULATE DATA
      var body = "";
      res.on('data', function(chunk) {
          body += chunk;
      });
      // RESOLVE ON END
      res.on('end', function() {
          try {
              var data = JSON.parse(body);
          } catch(e) {
              reject(e);
          }
          resolve(data);
      });
    }).on('error', (e) => {
      reject(Error(e))
    });
  })
  
}

// ---------------------------------------------------------------
//  PRODUCT GET    
// ---------------------------------------------------------------

async function getProductData(id){
  
  var product_options = {
    host: "bra2tww5y1.execute-api.eu-west-1.amazonaws.com",
    path: "/dev/products/" + id,
    headers: {
      "x-api-key": product_api_key,
      "Access-Control-Allow-Origin": '*'
    }
  }

  // RETURNS PROMISE WITH DATA
  return new Promise(function(resolve, reject) {
    https.get(product_options, function(res){
      // REJECT ON BAD STATUS
      if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('statusCode=' + res.statusCode));
      }
      // CUMULATE DATA
      var body = "";
      res.on('data', function(chunk) {
          body += chunk;
      });
      // RESOLVE ON END
      res.on('end', function() {
          try {
              var data = JSON.parse(body);
          } catch(e) {
              reject(e);
          }
          resolve(data);
      });
    }).on('error', (e) => {
      reject(Error(e))
    });
  });
}

// ---------------------------------------------------------------
//  INVENTORY POST
// ---------------------------------------------------------------

async function updateInventory(id, products){
  
  var product_id = id;
  
  // TODO: BUILD PRODUCTS OBJECT INCLUDING AMOUNT DATA FOR EACH PRODUCT
  
  var inventory_options = {
    host: "https://gljjr6hwrd.execute-api.eu-north-1.amazonaws.com",
    path: "/dev/inventory/"+ product_id ,
    headers: {
      "x-api-key": inventory_api_key,
      "Access-Control-Allow-Origin": '*'
    }
  }
  
  // RETURNS PROMISE WITH DATA
  return new Promise(function(resolve, reject) {
    https.post(inventory_options, function(res){
      // REJECT ON BAD STATUS
      if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('statusCode=' + res.statusCode));
      }
      if(res.statusCode == 200){
        resolve(res.statusCode);
      }
      // CUMULATE DATA
      var body = "";
      res.on('data', function(chunk) {
          body += chunk;
      });
      // RESOLVE ON END
      res.on('end', function() {
          try {
              var data = JSON.parse(body);
          } catch(e) {
              reject(e);
          }
          resolve(data);
      });
    }).on('error', (e) => {
      reject(Error(e))
    });
  })
  
}

// ---------------------------------------------------------------
//      HELPER FUNCTIONS
// ---------------------------------------------------------------

// ---------------------------------------------------------------
//  PRODUCT API CALL CHAIN
// ---------------------------------------------------------------

async function recursiveGetProductChain(list){
    
    const products = list
    const nextProduct = products.shift();
    
    // AS LONG AS THERE IS A VALUE TO NEXT PRODUCT RUN getProductData FUNCTION
    if(nextProduct !== undefined){
        return getProductData(nextProduct).then(function(value){product_data.push(value)}).then(_ => recursiveGetProductChain(list))
    } else {
        return Promise.resolve();
    }
}

// ---------------------------------------------------------------
//  EMAIL FUNCTION
// ---------------------------------------------------------------
async function sendEmail(user_data, event, callback){
  
  var params = {
        Destination: {
            ToAddresses: ["alexander.lilja@live.com"]
        },
        Message: {
            Body: {
                Text: { 
                  Data: email_order
                }  
            },
            
            Subject: { Data: "Order Confirmation"
            }
        },
        Source: "alexander.lilja@live.com"
    };

    
     ses.sendEmail(params, function (err, data) {
        callback(null, {err: err, data: data});
        if (err) {
            console.log(err);
            context.fail(err);
        } else {
            
            console.log(data);
            context.succeed(event);
        }
    });
}
// ---------------------------------------------------------------
//    HANDLER
// ---------------------------------------------------------------

var handler = async function(event, context, callback) {
  
  // STORING DATA FROM POST REQUEST BODY
  user = event.user;
  order = event.order;
  
  const products = Object.keys(order);
  const amounts = Object.values(order);

  // EXTERNAL API CALL RESPONSE STORAGE
  product_data = [];
  inventory_data = {"test": 0};
  customer_data = "";
  
  // BUILDS RESPONSE DATA ARRAY FOR PRODUCTS
  await recursiveGetProductChain(products);
  
  // BASIC LOOP TO PUSH AMOUNT TO EACH PRODUCT
  for(let i in product_data){
    product_data[i].amount = amounts[i];
  }
  
  await getCustomerData(user).then(function(value){customer_data = value;}); // CUSTOMER
  //await updateInventory(); // INVENTORY
  
  // ORDER INFORMATION OBJECT
  var order_info = {
    inventory_info: inventory_data,
    customer_info: {
      firstname: customer_data.firstname,
      lastname: customer_data.lastname,
      email: customer_data.email,
      phone: customer_data.phone,
      adress: customer_data.adress,
      zipcode: customer_data.zipcode,
      country: customer_data.country
    },
    products_info: product_data
  }
  
  email_order = JSON.stringify(order_info);
  
  // RESPONSE OBJECT
  var receipt = {
    statusCode: 200,
    header: "application/json",
    body: order_info
  }
  
  await sendEmail(customer_data.email, event, callback); // SEND EMAIL FUNCTION
  
  return receipt;

}

// EXPORT HANDLER ASYNC FUNCTION
exports.handler = handler;
