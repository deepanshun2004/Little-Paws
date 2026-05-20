const BaseModel = require("./_base");

class Product extends BaseModel {
  constructor(data = {}) {
    super({
      averageReview: null,
      ...data,
    });
  }

  static get tableName() {
    return "products";
  }

  static get columns() {
    return [
      "image",
      "title",
      "description",
      "category",
      "brand",
      "price",
      "salePrice",
      "totalStock",
      "averageReview",
      "availability",
      "sellerId",
    ];
  }

  static get numericFields() {
    return ["price", "salePrice", "totalStock", "averageReview", "sellerId"];
  }
}

module.exports = Product;
