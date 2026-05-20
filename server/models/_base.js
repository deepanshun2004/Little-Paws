const { query } = require("../db/mysql");

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

class BaseModel {
  constructor(data = {}) {
    Object.assign(this, data);

    if (data._id && !Object.prototype.hasOwnProperty.call(this, "__id")) {
      Object.defineProperty(this, "__id", {
        value: Number(data._id),
        writable: true,
        enumerable: false,
      });
    }
  }

  static get tableName() {
    throw new Error("tableName must be implemented by subclasses");
  }

  static get columns() {
    return [];
  }

  static get jsonFields() {
    return [];
  }

  static get timestamps() {
    return true;
  }

  static get numericFields() {
    return [];
  }

  static fromRow(row) {
    if (!row) {
      return null;
    }

    const data = { ...row };

    for (const field of this.jsonFields) {
      const fallback = field === "pictures" || field === "items" || field === "cartItems" ? [] : {};
      data[field] = parseJson(data[field], fallback);
    }

    for (const field of this.numericFields) {
      if (data[field] !== null && data[field] !== undefined) {
        data[field] = Number(data[field]);
      }
    }

    data._id = String(data.id);
    delete data.id;

    const instance = new this(data);
    Object.defineProperty(instance, "__id", {
      value: Number(row.id),
      writable: true,
      enumerable: false,
    });

    return instance;
  }

  static buildWhere(criteria = {}) {
    const entries = Object.entries(criteria).filter(([, value]) => value !== undefined);

    if (!entries.length) {
      return {
        clause: "",
        params: [],
      };
    }

    return {
      clause: ` WHERE ${entries
        .map(([key]) => `\`${key === "_id" ? "id" : key}\` = ?`)
        .join(" AND ")}`,
      params: entries.map(([, value]) => value),
    };
  }

  static async find(criteria = {}) {
    const { clause, params } = this.buildWhere(criteria);
    const rows = await query(`SELECT * FROM \`${this.tableName}\`${clause}`, params);
    return rows.map((row) => this.fromRow(row));
  }

  static async findOne(criteria = {}) {
    const { clause, params } = this.buildWhere(criteria);
    const rows = await query(
      `SELECT * FROM \`${this.tableName}\`${clause} LIMIT 1`,
      params
    );
    return this.fromRow(rows[0]);
  }

  static async findById(id) {
    const rows = await query(`SELECT * FROM \`${this.tableName}\` WHERE id = ? LIMIT 1`, [id]);
    return this.fromRow(rows[0]);
  }

  static async findByIdAndDelete(id) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    await query(`DELETE FROM \`${this.tableName}\` WHERE id = ?`, [id]);
    return existing;
  }

  static async findByIdAndUpdate(id, updates = {}, options = {}) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    Object.assign(existing, updates);
    await existing.save();
    return options.new ? existing : this.findById(id);
  }

  static async findOneAndUpdate(criteria = {}, updates = {}, options = {}) {
    const existing = await this.findOne(criteria);
    if (!existing) {
      return null;
    }

    Object.assign(existing, updates);
    await existing.save();
    return options.new ? existing : this.findById(existing._id);
  }

  static async findOneAndDelete(criteria = {}) {
    const existing = await this.findOne(criteria);
    if (!existing) {
      return null;
    }

    await query(`DELETE FROM \`${this.tableName}\` WHERE id = ?`, [existing._id]);
    return existing;
  }

  serializeField(field, value) {
    if (this.constructor.jsonFields.includes(field)) {
      return JSON.stringify(value ?? (Array.isArray(value) ? [] : {}));
    }

    return value ?? null;
  }

  async save() {
    const now = new Date();
    const fields = [...this.constructor.columns];

    if (this.constructor.timestamps) {
      if (!this.createdAt) {
        this.createdAt = now;
      }

      this.updatedAt = now;
      fields.push("createdAt", "updatedAt");
    }

    const values = fields.map((field) => this.serializeField(field, this[field]));

    if (this.__id) {
      const assignments = fields.map((field) => `\`${field}\` = ?`).join(", ");
      await query(
        `UPDATE \`${this.constructor.tableName}\` SET ${assignments} WHERE id = ?`,
        [...values, this.__id]
      );
      return this;
    }

    const placeholders = fields.map(() => "?").join(", ");
    const result = await query(
      `INSERT INTO \`${this.constructor.tableName}\` (${fields
        .map((field) => `\`${field}\``)
        .join(", ")}) VALUES (${placeholders})`,
      values
    );

    this.__id = Number(result.insertId);
    this._id = String(result.insertId);
    return this;
  }
}

module.exports = BaseModel;
