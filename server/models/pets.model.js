const BaseModel = require("./_base");

class Pet extends BaseModel {
  constructor(data = {}) {
    super({
      pictures: [],
      image: null,
      reportLocation: null,
      source: "shelter",
      distanceFromChandigarhKm: 0,
      pickupEligible: 0,
      pickupMessage: null,
      foster: null,
      shelter: null,
      reportStatus: "approved",
      reportSeenAt: null,
      ...data,
    });
  }

  static get tableName() {
    return "pets";
  }

  static get columns() {
    return [
      "pictures",
      "image",
      "name",
      "type",
      "category",
      "breed",
      "gender",
      "description",
      "age",
      "healthStatus",
      "region",
      "reportLocation",
      "latitude",
      "longitude",
      "source",
      "distanceFromChandigarhKm",
      "pickupEligible",
      "pickupMessage",
      "reportIssueReason",
      "foster",
      "shelter",
      "reportStatus",
      "reportSeenAt",
    ];
  }

  static get jsonFields() {
    return ["pictures"];
  }

  static get numericFields() {
    return ["age", "distanceFromChandigarhKm", "pickupEligible", "foster", "shelter", "latitude", "longitude"];
  }
}

module.exports = Pet;
