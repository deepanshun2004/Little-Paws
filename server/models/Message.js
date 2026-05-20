const BaseModel = require("./_base");

class Message extends BaseModel {
  static get tableName() {
    return "messages";
  }

  static get columns() {
    return ["senderId", "receiverId", "roomId", "body"];
  }

  static get numericFields() {
    return ["senderId", "receiverId"];
  }
}

module.exports = Message;
