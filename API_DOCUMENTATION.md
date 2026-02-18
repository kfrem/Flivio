# Restaurant-IQ API Documentation
## RESTful API Reference

**Version:** 1.0  
**Base URL:** `https://yourdomain.com/api`  
**Authentication:** Session-based (cookies)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Restaurants](#restaurants)
3. [Monthly Data](#monthly-data)
4. [Cost Categories](#cost-categories)
5. [Cost Items](#cost-items)
6. [Suppliers](#suppliers)
7. [Ingredients](#ingredients)
8. [Menu Items](#menu-items)
9. [Promotions](#promotions)
10. [Data Import](#data-import)
11. [Error Handling](#error-handling)

---

## Authentication

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "string (required, unique)",
  "password": "string (required, min 6 characters)"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "username": "string"
}
```

**Errors:**
- `400`: Invalid input
- `409`: Username already exists
- `500`: Server error

---

### Login
Authenticate and create session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "username": "string"
}
```

**Errors:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Server error

---

### Logout
End current session.

**Endpoint:** `POST /api/auth/logout`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User
Retrieve authenticated user info.

**Endpoint:** `GET /api/auth/user`

**Response (200):**
```json
{
  "id": "uuid",
  "username": "string"
}
```

**Errors:**
- `401`: Not authenticated
- `404`: User not found

---

## Restaurants

### Get Current Restaurant
Retrieve the first restaurant (single-tenant mode).

**Endpoint:** `GET /api/restaurants/current`

**Response (200):**
```json
{
  "id": 1,
  "name": "The Golden Fork",
  "type": "Mediterranean",
  "location": "London, Shoreditch",
  "seatingCapacity": 65,
  "avgMonthlyCovers": 2200
}
```

**Errors:**
- `404`: No restaurant found
- `500`: Server error

---

### Get All Restaurants
List all restaurants.

**Endpoint:** `GET /api/restaurants`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Restaurant Name",
    "type": "Cuisine Type",
    "location": "Location",
    "seatingCapacity": 50,
    "avgMonthlyCovers": 1500
  }
]
```

---

### Create Restaurant
Add a new restaurant.

**Endpoint:** `POST /api/restaurants`

**Request Body:**
```json
{
  "name": "string (required)",
  "type": "string (required)",
  "location": "string (required)",
  "seatingCapacity": "integer (required)",
  "avgMonthlyCovers": "integer (required)"
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "New Restaurant",
  "type": "Italian",
  "location": "Manchester",
  "seatingCapacity": 80,
  "avgMonthlyCovers": 2500
}
```

---

## Monthly Data

### Get All Monthly Data
Retrieve all financial data entries.

**Endpoint:** `GET /api/monthly-data`

**Response (200):**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "month": "February",
    "year": 2026,
    "revenue": 84500,
    "foodCost": 28730,
    "labourCost": 24505,
    "energyCost": 5915,
    "rentCost": 6500,
    "marketingCost": 3380,
    "suppliesCost": 2112,
    "technologyCost": 845,
    "wasteCost": 2535,
    "deliveryRevenue": 15210,
    "dineInRevenue": 55770,
    "takeawayRevenue": 13520,
    "totalCovers": 2112,
    "avgTicketSize": 29.20,
    "repeatCustomerRate": 33
  }
]
```

---

### Get Monthly Data by Restaurant
Filter monthly data by restaurant ID.

**Endpoint:** `GET /api/monthly-data/:restaurantId`

**Parameters:**
- `restaurantId` (path): Integer

**Response (200):** Array of monthly data objects

**Errors:**
- `400`: Invalid restaurant ID
- `500`: Server error

---

### Create Monthly Data Entry
Add new financial data for a month.

**Endpoint:** `POST /api/monthly-data`

**Request Body:**
```json
{
  "restaurantId": 1,
  "month": "March",
  "year": 2026,
  "revenue": 90000,
  "foodCost": 30000,
  "labourCost": 25000,
  "energyCost": 6000,
  "rentCost": 6500,
  "marketingCost": 3500,
  "suppliesCost": 2200,
  "technologyCost": 900,
  "wasteCost": 2500,
  "deliveryRevenue": 18000,
  "dineInRevenue": 60000,
  "takeawayRevenue": 12000,
  "totalCovers": 2250,
  "avgTicketSize": 30.00,
  "repeatCustomerRate": 35
}
```

**Response (201):** Created monthly data object

---

## Cost Categories

### Get All Cost Categories
List all cost category templates.

**Endpoint:** `GET /api/cost-categories`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Food & Ingredients",
    "key": "foodCost",
    "description": "Raw ingredients, beverages, and consumables",
    "defaultPercentage": 30,
    "icon": "ShoppingCart",
    "processStage": "procurement",
    "classification": "direct",
    "isDefault": true,
    "sortOrder": 1
  }
]
```

---

### Create Cost Category
Add a custom cost category.

**Endpoint:** `POST /api/cost-categories`

**Request Body:**
```json
{
  "name": "Custom Category",
  "key": "customCost",
  "description": "Description",
  "defaultPercentage": 5,
  "icon": "Icon",
  "processStage": "stage",
  "classification": "direct",
  "sortOrder": 13
}
```

**Response (201):** Created cost category

---

## Cost Items

### Get Restaurant Cost Items
Retrieve cost items configured for a restaurant.

**Endpoint:** `GET /api/restaurant-cost-items/:restaurantId`

**Parameters:**
- `restaurantId` (path): Integer

**Response (200):**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "costCategoryId": 1,
    "enabled": true,
    "customLabel": "Premium Ingredients",
    "customPercentage": 32
  }
]
```

---

### Create Cost Item
Add a cost item for a restaurant.

**Endpoint:** `POST /api/restaurant-cost-items`

**Request Body:**
```json
{
  "restaurantId": 1,
  "costCategoryId": 1,
  "enabled": true,
  "customLabel": "Optional custom label",
  "customPercentage": 28
}
```

**Response (201):** Created cost item

---

### Update Cost Item
Modify an existing cost item.

**Endpoint:** `PUT /api/restaurant-cost-items/:id`

**Parameters:**
- `id` (path): Integer

**Request Body:** Partial cost item object

**Response (200):** Updated cost item

---

### Bulk Save Cost Items
Replace all cost items for a restaurant.

**Endpoint:** `POST /api/restaurant-cost-items/bulk/:restaurantId`

**Parameters:**
- `restaurantId` (path): Integer

**Request Body:**
```json
{
  "items": [
    {
      "costCategoryId": 1,
      "enabled": true,
      "customLabel": null,
      "customPercentage": 30
    }
  ]
}
```

**Response (201):** Array of created cost items

---

## Suppliers

### Get Suppliers
List all suppliers for a restaurant.

**Endpoint:** `GET /api/suppliers/:restaurantId`

**Parameters:**
- `restaurantId` (path): Integer

**Response (200):**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "name": "FreshFarm Foods",
    "contactInfo": "info@freshfarm.co.uk",
    "category": "Produce",
    "isActive": true
  }
]
```

---

### Create Supplier
Add a new supplier.

**Endpoint:** `POST /api/suppliers`

**Request Body:**
```json
{
  "restaurantId": 1,
  "name": "Supplier Name",
  "contactInfo": "contact details",
  "category": "Category",
  "isActive": true
}
```

**Response (201):** Created supplier

---

### Update Supplier
Modify supplier details.

**Endpoint:** `PUT /api/suppliers/:id`

**Parameters:**
- `id` (path): Integer

**Request Body:** Partial supplier object

**Response (200):** Updated supplier

---

### Delete Supplier
Remove a supplier.

**Endpoint:** `DELETE /api/suppliers/:id`

**Parameters:**
- `id` (path): Integer

**Response (200):**
```json
{
  "message": "Supplier deleted successfully"
}
```

---

## Ingredients

### Get Ingredients
List all ingredients for a restaurant.

**Endpoint:** `GET /api/ingredients/:restaurantId`

**Parameters:**
- `restaurantId` (path): Integer

**Response (200):**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "name": "Atlantic Salmon Fillet",
    "unit": "kg",
    "currentPrice": 16.50,
    "previousPrice": 15.20,
    "category": "Fish & Seafood",
    "classification": "direct",
    "vatRate": 20,
    "vatIncluded": true
  }
]
```

---

### Create Ingredient
Add a new ingredient.

**Endpoint:** `POST /api/ingredients`

**Request Body:**
```json
{
  "restaurantId": 1,
  "name": "Ingredient Name",
  "unit": "kg",
  "currentPrice": 10.50,
  "previousPrice": 10.00,
  "category": "Category",
  "classification": "direct",
  "vatRate": 20,
  "vatIncluded": true
}
```

**Response (201):** Created ingredient

---

### Update Ingredient
Modify ingredient details.

**Endpoint:** `PUT /api/ingredients/:id`

**Parameters:**
- `id` (path): Integer

**Request Body:** Partial ingredient object

**Response (200):** Updated ingredient

---

### Delete Ingredient
Remove an ingredient.

**Endpoint:** `DELETE /api/ingredients/:id`

**Parameters:**
- `id` (path): Integer

**Response (200):**
```json
{
  "message": "Ingredient deleted successfully"
}
```

---

## Supplier Ingredients

### Get Supplier Ingredients
List ingredients from a specific supplier.

**Endpoint:** `GET /api/supplier-ingredients/:supplierId`

**Parameters:**
- `supplierId` (path): Integer

**Response (200):**
```json
[
  {
    "id": 1,
    "supplierId": 1,
    "ingredientId": 1,
    "unitPrice": 16.50,
    "isPreferred": true,
    "leadTimeDays": 2
  }
]
```

---

### Link Supplier to Ingredient
Create supplier-ingredient relationship.

**Endpoint:** `POST /api/supplier-ingredients`

**Request Body:**
```json
{
  "supplierId": 1,
  "ingredientId": 1,
  "unitPrice": 16.50,
  "isPreferred": true,
  "leadTimeDays": 2
}
```

**Response (201):** Created link

---

### Delete Supplier Ingredient Link
Remove supplier-ingredient relationship.

**Endpoint:** `DELETE /api/supplier-ingredients/:id`

**Parameters:**
- `id` (path): Integer

**Response (200):**
```json
{
  "message": "Link deleted successfully"
}
```

---

## Menu Items

### Get Menu Items
List all menu items for a restaurant.

**Endpoint:** `GET /api/menu-items/:restaurantId`

**Parameters:**
- `restaurantId` (path): Integer

**Response (200):**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "name": "Grilled Sea Bass",
    "category": "Mains",
    "sellingPrice": 18.50,
    "description": "Fresh sea bass with seasonal vegetables",
    "isActive": true,
    "outputVatRate": 20,
    "vatIncluded": true
  }
]
```

---

### Create Menu Item
Add a new menu item.

**Endpoint:** `POST /api/menu-items`

**Request Body:**
```json
{
  "restaurantId": 1,
  "name": "Menu Item Name",
  "category": "Category",
  "sellingPrice": 15.00,
  "description": "Description",
  "isActive": true,
  "outputVatRate": 20,
  "vatIncluded": true
}
```

**Response (201):** Created menu item

---

### Delete Menu Item
Remove a menu item.

**Endpoint:** `DELETE /api/menu-items/:id`

**Parameters:**
- `id` (path): Integer

**Response (200):**
```json
{
  "message": "Menu item deleted successfully"
}
```

---

## Menu Item Ingredients

### Get Recipe Ingredients
List ingredients for a menu item.

**Endpoint:** `GET /api/menu-item-ingredients/:menuItemId`

**Parameters:**
- `menuItemId` (path): Integer

**Response (200):**
```json
[
  {
    "id": 1,
    "menuItemId": 1,
    "ingredientId": 1,
    "quantity": 0.2,
    "unit": "kg"
  }
]
```

---

### Save Recipe (Bulk)
Set all ingredients for a menu item.

**Endpoint:** `POST /api/menu-item-ingredients/bulk/:menuItemId`

**Parameters:**
- `menuItemId` (path): Integer

**Request Body:**
```json
{
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 0.2,
      "unit": "kg"
    }
  ]
}
```

**Response (201):** Array of created recipe ingredients

---

## Promotions

### Get Promotions
List all promotions for a restaurant.

**Endpoint:** `GET /api/promotions/:restaurantId`

**Parameters:**
- `restaurantId` (path): Integer

**Response (200):**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "name": "Happy Hour Special",
    "discountPercent": 20,
    "menuItemId": 1,
    "targetProfit": 8.00,
    "isActive": true
  }
]
```

---

### Create Promotion
Add a new promotion.

**Endpoint:** `POST /api/promotions`

**Request Body:**
```json
{
  "restaurantId": 1,
  "name": "Promotion Name",
  "discountPercent": 15,
  "menuItemId": 1,
  "targetProfit": 10.00,
  "isActive": true
}
```

**Response (201):** Created promotion

---

### Delete Promotion
Remove a promotion.

**Endpoint:** `DELETE /api/promotions/:id`

**Parameters:**
- `id` (path): Integer

**Response (200):**
```json
{
  "message": "Promotion deleted successfully"
}
```

---

## Data Import

### Import Ingredients
Bulk import ingredients from CSV data.

**Endpoint:** `POST /api/import/ingredients`

**Request Body:**
```json
{
  "restaurantId": 1,
  "data": [
    {
      "name": "Ingredient 1",
      "unit": "kg",
      "currentPrice": 10.50,
      "category": "Produce",
      "classification": "direct"
    }
  ]
}
```

**Response (201):**
```json
{
  "imported": 25
}
```

---

### Import Suppliers
Bulk import suppliers from CSV data.

**Endpoint:** `POST /api/import/suppliers`

**Request Body:**
```json
{
  "restaurantId": 1,
  "data": [
    {
      "name": "Supplier Name",
      "contactInfo": "contact@supplier.com",
      "category": "Produce"
    }
  ]
}
```

**Response (201):**
```json
{
  "imported": 10
}
```

---

### Import Menu Items
Bulk import menu items from CSV data.

**Endpoint:** `POST /api/import/menu-items`

**Request Body:**
```json
{
  "restaurantId": 1,
  "data": [
    {
      "name": "Menu Item",
      "category": "Mains",
      "sellingPrice": 15.00,
      "description": "Description"
    }
  ]
}
```

**Response (201):**
```json
{
  "imported": 30
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

**Response (429):**
```json
{
  "message": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## Pagination (Planned)

Future endpoints will support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Headers:**
- `X-Total-Count`: Total items
- `X-Total-Pages`: Total pages
- `X-Current-Page`: Current page

---

## Webhooks (Planned)

Subscribe to events:

- `restaurant.created`
- `monthly_data.created`
- `supplier.price_change`
- `promotion.activated`

---

## Support

- **Email:** api@restaurant-iq.com
- **Documentation:** https://docs.restaurant-iq.com
- **Status Page:** https://status.restaurant-iq.com

---

*Last Updated: February 2026*  
*API Version: 1.0*
