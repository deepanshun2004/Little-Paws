const BaseModel = require("./_base");

class Payment extends BaseModel {
  constructor(data = {}) {
    super({
      status: "pending",
      ...data,
    });
  }

  static get tableName() {
    return "payments";
  }

  static get columns() {
    return ["orderId", "userId", "method", "status", "amount", "reference"];
  }

  static get numericFields() {
    return ["orderId", "userId", "amount"];
  }
}

module.exports = Payment;
