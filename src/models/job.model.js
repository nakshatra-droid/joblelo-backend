import { JOB_TYPES,JOB_TYPE } from "../config/constants.js";

export default (sequelize, DataTypes) => {
  const Job = sequelize.define(
    "Job",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      company_id: { type: DataTypes.INTEGER, allowNull: false },
      created_by: { type: DataTypes.INTEGER },

      title: { type: DataTypes.STRING, allowNull: false },
      job_description: DataTypes.TEXT,
      salary: DataTypes.STRING,
      location: DataTypes.STRING,

      job_type: {
        type: DataTypes.ENUM(...JOB_TYPES),
        defaultValue: JOB_TYPE,
      },
    },
    {
      tableName: "jobs",
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",

      indexes: [
        { fields: ["company_id"] },
        { fields: ["created_by"] },
        { fields: ["title"] },
        { fields: ["location"] },
      ],
    }
  );

  Job.associate = (models) => {
    Job.belongsTo(models.Company, { foreignKey: "company_id" });
    Job.belongsTo(models.User, { foreignKey: "created_by" });
    Job.hasMany(models.Application, { foreignKey: "job_id" });
  };

  return Job;
};
