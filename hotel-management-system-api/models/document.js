"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Document.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }
  Document.init(
    {
      userId: DataTypes.INTEGER,
      documentType: {
        type: DataTypes.ENUM(
          "profile_photo",
          "national_id",
          "passport",
          "student_id",
          "medical_card",
          "contract",
          "other"
        ),
        allowNull: false,
      },
      fileName: DataTypes.STRING,
      filePath: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Document",
    }
  );
  return Document;
};
