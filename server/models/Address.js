const BaseModel = require("./_base");

class Address extends BaseModel {
  static get tableName() {
    return "addresses";
  }

  static get columns() {
    return ["userId", "address", "city", "pincode", "phone", "notes"];
  }

  static get numericFields() {
    return ["userId"];
  }
}

module.exports = Address;
