export default (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    "UserRole",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      role_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "user_roles",
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",

      indexes: [
        { fields: ["user_id"] },
        { fields: ["role_id"] },
        { unique: true, fields: ["user_id", "role_id"] },
      ],
    }
  );

  UserRole.associate = (models) => {
    UserRole.belongsTo(models.Role, { foreignKey: "role_id" });
    UserRole.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return UserRole;
};
