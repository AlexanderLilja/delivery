# Delivery API
Delivery API built for Cloud Native Apps.
## Endpoint
https://3udzuhku11.execute-api.eu-west-1.amazonaws.com/delivery

## How it works
We get an order posted through the UI which sends the necessary information we need to retrieve more descriptive information about the customer and products held in the order itself.
By sending the required information in json format embedded in the request body, it runs through all the functions and returns a receipt of the purchase as the response. It also sends an email to the address linked to the user_id that gets sent in the request body.

### Example input
```json
{
    "user": "e289f36e-7c9d-4e88-9435-fac296f391ed",
    "order": {
        "91025263-8117-49ee-83fe-9df6d3ea1dde": 3,
	"4d71bd14-cb7e-4b24-a858-8513b043e3fd": 4
	}
}
```
Here you can see the format required of the request body. User key holds the user_id as value. The order holds a key-value object where the key is the product_id and the value is the amount.
### Example output
```json
{
    "statusCode": 200,
    "header": "application/json",
    "body": {
        "inventory_info": {
            "test": 0
        },
        "customer_info": {
            "firstname": "Jocke",
            "lastname": "Andersson",
            "email": "jocaa@fake.com",
            "phone": "2903819031",
            "adress": "Skogsvägen 1",
            "zipcode": "00100",
            "country": "Finland"
        },
        "products_info": {
            "product_data": [
                {
                    "productId": "91025263-8117-49ee-83fe-9df6d3ea1dde",
                    "modelNumber": "H8",
                    "productName": "Cool Hat",
                    "productDesc": "A cool hat",
                    "productPrice": "37,00",
                    "amount": 3,
                    "totalCost": 111
                },
                {
                    "productId": "4d71bd14-cb7e-4b24-a858-8513b043e3fd",
                    "modelNumber": "H8",
                    "productName": "Cool Hat",
                    "productDesc": "A cool hat",
                    "productPrice": "37,00",
                    "amount": 4,
                    "totalCost": 148
                }
            ],
            "TotalSum": 259
        }
    }
}
```
Here you can see the inventory information which is supposed to just return a response saying that the amount for the products in the order were updated successfully. The customer_info is processed to just return the necessary data for the order confirmation. The product_info object keeps all product data in an array which holds product id's, amounts, prices and the grand total of all the products.
