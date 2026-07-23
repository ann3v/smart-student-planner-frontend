import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export type ActivityType = 'class' | 'study' | 'break' | 'other';

interface ScheduleAttributes {
  id: number;
  userId: number;
  subjectId: number | null;
  taskId: number | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
  title: string;
  isRecurring: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  createdAt: Date;
}

interface ScheduleCreationAttributes {
  userId: number;
  subjectId?: number | null;
  taskId?: number | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  activityType?: ActivityType;
  title: string;
  isRecurring?: boolean;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
}

class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  declare id: number;
  declare userId: number;
  declare subjectId: number | null;
  declare taskId: number | null;
  declare dayOfWeek: number;
  declare startTime: string;
  declare endTime: string;
  declare activityType: ActivityType;
  declare title: string;
  declare isRecurring: boolean;
  declare reminderEnabled: boolean;
  declare reminderMinutesBefore: number;
  declare createdAt: Date;
}

Schedule.init({
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
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  activityType: {
    type: DataTypes.ENUM('class', 'study', 'break', 'other'),
    defaultValue: 'study'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderMinutesBefore: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'schedule',
  timestamps: false,
  sequelize,
});

export default Schedule;
