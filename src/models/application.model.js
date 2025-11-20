export default (sequelize, DataTypes) => {
  const Application = sequelize.define(
    "Application",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      job_id: { type: DataTypes.INTEGER, allowNull: false },
      job_seeker_id: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM("applied", "selected", "rejected"),
        defaultValue: "applied",
      },
    },
    {
      tableName: "applications",
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        { fields: ["job_id"] },
        { fields: ["job_seeker_id"] },
        { fields: ["status"] }
      ]
    }
  );

  Application.associate = (models) => {
    Application.belongsTo(models.Job, { foreignKey: "job_id" });
    Application.belongsTo(models.User, { foreignKey: "job_seeker_id" });
  };

  return Application;
};