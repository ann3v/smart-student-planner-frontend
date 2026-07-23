import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface SubjectAttributes {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: Date;
}

interface SubjectCreationAttributes {
  userId: number;
  name: string;
  color?: string;
}

class Subject extends Model<SubjectAttributes, SubjectCreationAttributes> implements SubjectAttributes {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare color: string;
  declare createdAt: Date;
}

Subject.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3498db'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subjects',
  timestamps: false,
  sequelize,
});

export default Subject;
