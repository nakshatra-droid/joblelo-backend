export default (sequelize, DataTypes) => {
  const Company = sequelize.define(
    "Company",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      tableName: "companies",
      timestamps: true,
      underscored: true,
    }
  );
  Company.associate = (models) => {
    Company.hasMany(models.Job, { foreignKey: "company_id" });
    Company.hasMany(models.CompanyUser, { foreignKey: "company_id" });
  };

  return Company;
};
