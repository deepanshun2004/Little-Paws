const BaseModel = require("./_base");

class Order extends BaseModel {
  constructor(data = {}) {
    super({
      cartItems: [],
      addressInfo: {},
      ...data,
    });
  }

  static get tableName() {
    return "orders";
  }

  static get columns() {
    return [
      "userId",
      "cartId",
      "cartItems",
      "addressInfo",
      "orderStatus",
      "paymentMethod",
      "paymentStatus",
      "trackingStatus",
      "paymentReference",
      "totalAmount",
      "orderDate",
      "orderUpdateDate",
      "paymentId",
      "payerId",
    ];
  }

  static get jsonFields() {
    return ["cartItems", "addressInfo"];
  }

  static get numericFields() {
    return ["userId", "cartId", "totalAmount"];
  }
}

module.exports = Order;
