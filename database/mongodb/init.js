db = db.getSiblingDB('salehub');

db.createCollection('product_documents');
db.createCollection('reports');

db.product_documents.createIndex({ "productId": 1 }, { unique: true });
db.product_documents.createIndex({ "name": "text", "description": "text" });
db.product_documents.createIndex({ "categoryId": 1 });
db.product_documents.createIndex({ "brandId": 1 });
db.product_documents.createIndex({ "price": 1 });
db.product_documents.createIndex({ "createdAt": -1 });

db.reports.createIndex({ "type": 1, "createdAt": -1 });
db.reports.createIndex({ "generatedAt": -1 });
