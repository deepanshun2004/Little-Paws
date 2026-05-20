const BaseModel = require("./_base");

class Review extends BaseModel {
  static get tableName() {
    return "reviews";
  }

  static get columns() {
    return ["productId", "userId", "rating", "comment"];
  }

  static get numericFields() {
    return ["productId", "userId", "rating"];
  }
}

module.exports = Review;
