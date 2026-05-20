const assert = require("node:assert/strict");
const test = require("node:test");

const BaseModel = require("../models/_base");

class TestModel extends BaseModel {
  static get tableName() {
    return "test_rows";
  }

  static get columns() {
    return ["name", "pictures", "price", "optional"];
  }

  static get jsonFields() {
    return ["pictures", "settings"];
  }

  static get numericFields() {
    return ["price"];
  }
}

test("fromRow maps id, parses JSON fields, and converts numeric fields", () => {
  const model = TestModel.fromRow({
    id: 7,
    name: "Food bowl",
    pictures: "[\"front.jpg\",\"side.jpg\"]",
    settings: "{\"featured\":true}",
    price: "149.50",
  });

  assert.equal(model._id, "7");
  assert.equal(model.name, "Food bowl");
  assert.deepEqual(model.pictures, ["front.jpg", "side.jpg"]);
  assert.deepEqual(model.settings, { featured: true });
  assert.equal(model.price, 149.5);
  assert.equal(model.__id, 7);
});

test("fromRow falls back safely when JSON fields are empty or invalid", () => {
  const model = TestModel.fromRow({
    id: 8,
    pictures: "",
    settings: "{bad json",
    price: null,
  });

  assert.deepEqual(model.pictures, []);
  assert.deepEqual(model.settings, {});
  assert.equal(model.price, null);
});

test("buildWhere creates a parameterized clause and skips undefined values", () => {
  assert.deepEqual(TestModel.buildWhere({ _id: "5", name: undefined, price: 100 }), {
    clause: " WHERE `id` = ? AND `price` = ?",
    params: ["5", 100],
  });
});

test("serializeField stringifies JSON fields and normalizes nullish values", () => {
  const model = new TestModel();

  assert.equal(model.serializeField("pictures", ["a.jpg"]), "[\"a.jpg\"]");
  assert.equal(model.serializeField("name", undefined), null);
});
