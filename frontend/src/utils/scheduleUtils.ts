import { SCHEDULE_TIME_RANGE } from './constants';
import type { ScheduleItem, ConflictResult } from '../types';

export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const timeStringToDate = (timeString: string): Date => {
  const [hours, minutes] = (timeString || '09:00').split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0);
  date.setMinutes(minutes || 0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

export const dateToTimeString = (date: Date): string => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const checkScheduleConflict = (
  day: number,
  start: string,
  end: string,
  daySchedules: ScheduleItem[],
  excludeId?: number
): ConflictResult => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes >= endMinutes) {
    return { hasConflict: true, message: 'End time must be after start time' };
  }

  const conflicting = daySchedules.find(schedule => {
    if (excludeId && schedule.id === excludeId) return false;

    const scheduleStart = timeToMinutes(schedule.startTime);
    const scheduleEnd = timeToMinutes(schedule.endTime);

    return (
      (startMinutes >= scheduleStart && startMinutes < scheduleEnd) ||
      (endMinutes > scheduleStart && endMinutes <= scheduleEnd) ||
      (startMinutes <= scheduleStart && endMinutes >= scheduleEnd)
    );
  });

  if (conflicting) {
    return {
      hasConflict: true,
      message: `Schedule conflicts with "${conflicting.title}" (${formatTime(conflicting.startTime)} - ${formatTime(conflicting.endTime)})`,
    };
  }

  return { hasConflict: false };
};

export const getScheduleBlockPosition = (startTime: string, endTime: string) => {
  const startMinutes = timeToMinutes(SCHEDULE_TIME_RANGE.start + ':00');
  const endMinutes = timeToMinutes(SCHEDULE_TIME_RANGE.end + ':00');
  const totalMinutes = endMinutes - startMinutes;

  const itemStart = timeToMinutes(startTime);
  const itemEnd = timeToMinutes(endTime);

  const top = ((itemStart - startMinutes) / totalMinutes) * 100;
  const height = ((itemEnd - itemStart) / totalMinutes) * 100;

  return { top, height: Math.max(height, 8) };
};
