const BaseModel = require("./_base");

class Shelter extends BaseModel {
  static get tableName() {
    return "shelters";
  }

  static get columns() {
    return ["name", "city", "shelterAdmin", "contact", "address"];
  }

  static get numericFields() {
    return ["shelterAdmin"];
  }
}

module.exports = Shelter;
