const BaseModel = require("./_base");

class Notification extends BaseModel {
  constructor(data = {}) {
    super({
      isRead: 0,
      type: "general",
      ...data,
    });
  }

  static get tableName() {
    return "notifications";
  }

  static get columns() {
    return ["userId", "title", "message", "type", "entityId", "isRead"];
  }

  static get numericFields() {
    return ["userId", "isRead"];
  }
}

module.exports = Notification;
