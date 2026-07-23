import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export type TaskPriority = 'low' | 'medium' | 'high';

interface TaskAttributes {
  id: number;
  userId: number;
  subjectId: number | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: Date | null;
  estimatedDuration: number | null;
  completed: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  reminderSent: boolean;
  createdAt: Date;
}

interface TaskCreationAttributes {
  userId: number;
  subjectId?: number | null;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: Date | null;
  estimatedDuration?: number | null;
  completed?: boolean;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  reminderSent?: boolean;
}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  declare id: number;
  declare userId: number;
  declare subjectId: number | null;
  declare title: string;
  declare description: string | null;
  declare priority: TaskPriority;
  declare dueDate: Date | null;
  declare estimatedDuration: number | null;
  declare completed: boolean;
  declare reminderEnabled: boolean;
  declare reminderMinutesBefore: number;
  declare reminderSent: boolean;
  declare createdAt: Date;
}

Task.init({
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
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderMinutesBefore: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tasks',
  timestamps: false,
  sequelize,
});

export default Task;
