const BaseModel = require("./_base");

class Chat extends BaseModel {
  constructor(data = {}) {
    super({
      participants: [],
      messages: [],
      ...data,
    });
  }

  static get tableName() {
    return "chats";
  }

  static get columns() {
    return ["participants", "messages"];
  }

  static get jsonFields() {
    return ["participants", "messages"];
  }
}

module.exports = Chat;
