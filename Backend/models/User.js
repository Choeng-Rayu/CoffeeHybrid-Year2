export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // since may not be required if googleId present
      validate: {
        len: [6, 100]
      }
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google', 'telegram'),
      defaultValue: 'local'
    },
    telegramId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    strikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    role: {
      type: DataTypes.ENUM('customer', 'seller', 'admin'),
      defaultValue: 'customer'
    },
    shopName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'users'
  });

  return User;
};
