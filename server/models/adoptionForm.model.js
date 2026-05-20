const BaseModel = require("./_base");

class AdoptionForm extends BaseModel {
  constructor(data = {}) {
    super({
      status: "pending",
      submissionDate: new Date(),
      ...data,
    });
  }

  static get tableName() {
    return "adoption_forms";
  }

  static get columns() {
    return [
      "user",
      "pet",
      "shelterId",
      "city",
      "personalInfo",
      "livingConditions",
      "petExperience",
      "adoptionDetails",
      "status",
      "withdrawalReason",
      "shelterMessage",
      "submissionDate",
    ];
  }

  static get jsonFields() {
    return ["personalInfo", "livingConditions", "petExperience", "adoptionDetails"];
  }

  static get numericFields() {
    return ["user", "pet", "shelterId"];
  }
}

module.exports = AdoptionForm;
