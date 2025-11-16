import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      password: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: true },
      country: { type: DataTypes.STRING, allowNull: true },
      experience: { type: DataTypes.INTEGER, allowNull: true },
      resume_url: { type: DataTypes.TEXT, allowNull: true },
      work_email: { type: DataTypes.STRING, allowNull: true },
      company: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
  User.associate = (models) => {
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: "user_id",
      otherKey: "role_id",
    });
    User.belongsToMany(models.Company, {
      through: models.CompanyUser,
      foreignKey: "user_id",
    });
    User.hasMany(models.Job, { foreignKey: "created_by" });
    User.hasMany(models.Application, { foreignKey: "job_seeker_id" });
  };
  User.prototype.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
  };
  User.prototype.generateAccessToken = function () {
    return jwt.sign(
      { id: this.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
  };

  return User;
};