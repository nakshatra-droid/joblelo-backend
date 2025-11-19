export default (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      tableName: "roles",
      timestamps: false,
      underscored: true,

      
      indexes: [{ fields: ["name"] }],
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: "role_id",
      otherKey: "user_id",
    });
  };

  return Role;
};
