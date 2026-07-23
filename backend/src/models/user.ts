import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  name: string | null;
  isVerified: boolean;
  verificationCodeHash: string | null;
  verificationExpiresAt: Date | null;
  failedLoginAttempts: number;
  failedVerificationAttempts: number;
  lockoutUntil: Date | null;
  createdAt: Date;
}

interface UserCreationAttributes {
  email: string;
  passwordHash: string;
  name?: string | null;
  isVerified?: boolean;
  verificationCodeHash?: string | null;
  verificationExpiresAt?: Date | null;
  failedLoginAttempts?: number;
  failedVerificationAttempts?: number;
  lockoutUntil?: Date | null;
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare name: string | null;
  declare isVerified: boolean;
  declare verificationCodeHash: string | null;
  declare verificationExpiresAt: Date | null;
  declare failedLoginAttempts: number;
  declare failedVerificationAttempts: number;
  declare lockoutUntil: Date | null;
  declare createdAt: Date;

  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  verificationCodeHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  failedVerificationAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lockoutUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false,
  sequelize,
});

export default User;
