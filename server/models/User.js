const BaseModel = require("./_base");

class User extends BaseModel {
  constructor(data = {}) {
    super({
      role: "user",
      city: null,
      emailVerified: 0,
      ...data,
    });
  }

  static get tableName() {
    return "users";
  }

  static get columns() {
    return [
      "userName",
      "email",
      "password",
      "role",
      "city",
      "profileImage",
      "firebaseUid",
      "authProvider",
      "emailVerified",
    ];
  }
}

module.exports = User;
