const BaseModel = require("./_base");

class Wishlist extends BaseModel {
  static get tableName() {
    return "wishlists";
  }

  static get columns() {
    return ["userId", "productId"];
  }

  static get numericFields() {
    return ["userId", "productId"];
  }
}

module.exports = Wishlist;
