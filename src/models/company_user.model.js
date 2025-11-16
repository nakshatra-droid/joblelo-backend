export default (sequelize, DataTypes) => {
  const CompanyUser = sequelize.define(
    "CompanyUser",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "company_user",
      timestamps: true,
      underscored: true,
    }
  );

  CompanyUser.associate = (models) => {
    CompanyUser.belongsTo(models.Company, { foreignKey: "company_id" });
    CompanyUser.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return CompanyUser;
};
