import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ACTIVITY_ICONS, SCHEDULE_TIME_RANGE } from '../utils/constants';

const ScheduleBlock = ({ timeSlot, onPress, onLongPress, backgroundColor }) => {
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return displayHour + ':' + minutes + ' ' + ampm;
  };

  const startMinutes = timeToMinutes(SCHEDULE_TIME_RANGE.start + ':00');
  const endMinutes = timeToMinutes(SCHEDULE_TIME_RANGE.end + ':00');
  const totalMinutes = endMinutes - startMinutes;

  const itemStart = timeToMinutes(timeSlot.startTime);
  const itemEnd = timeToMinutes(timeSlot.endTime);

  const top = ((itemStart - startMinutes) / totalMinutes) * 100;
  const height = ((itemEnd - itemStart) / totalMinutes) * 100;

  const iconName = ACTIVITY_ICONS[timeSlot.activityType] || 'event';

  return (
    <TouchableOpacity
      style={[
        styles.timeSlotItem,
        {
          top: `${top}%` as any,
          height: `${Math.max(height, 8)}%` as any,
          backgroundColor: backgroundColor,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.timeSlotContent}>
        <View style={styles.timeSlotHeader}>
          <View style={styles.timeSlotIconBadge}>
            <MaterialIcons name={iconName} size={14} color="#fff" />
          </View>
          <Text style={styles.timeSlotTitle} numberOfLines={1}>
            {timeSlot.title}
          </Text>
        </View>

        <View style={styles.timeSlotDetails}>
          <View style={styles.timeSlotTimeRow}>
            <MaterialIcons name="access-time" size={12} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.timeSlotTime}>
              {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
            </Text>
          </View>

          {timeSlot.Subject && (
            <View style={styles.timeSlotSubjectRow}>
              <MaterialIcons name="label" size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.timeSlotSubject} numberOfLines={1}>
                {timeSlot.Subject.name}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  timeSlotItem: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
  },
  timeSlotContent: {
    flex: 1,
    padding: 10,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  timeSlotTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  timeSlotDetails: {
    marginTop: 6,
  },
  timeSlotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeSlotTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginLeft: 4,
  },
  timeSlotSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotSubject: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginLeft: 4,
  },
});

export default ScheduleBlock;
