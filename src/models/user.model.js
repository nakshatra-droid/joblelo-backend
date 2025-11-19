import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      full_name: { type: DataTypes.STRING, allowNull: false },

      email: { type: DataTypes.STRING, allowNull: false, unique: true },

      phone: { type: DataTypes.STRING },

      password: { type: DataTypes.STRING, allowNull: false },

      city: DataTypes.STRING,
      country: DataTypes.STRING,
      experience: DataTypes.INTEGER,
      resume_url: DataTypes.TEXT,

      work_email: DataTypes.STRING,

      company: DataTypes.STRING,
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",

      indexes: [{ unique: true, fields: ["email"] }],

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
