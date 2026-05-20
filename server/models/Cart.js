const BaseModel = require("./_base");

class Cart extends BaseModel {
  constructor(data = {}) {
    super({
      items: [],
      ...data,
    });
  }

  static get tableName() {
    return "carts";
  }

  static get columns() {
    return ["userId", "items"];
  }

  static get jsonFields() {
    return ["items"];
  }

  static get numericFields() {
    return ["userId"];
  }
}

module.exports = Cart;
