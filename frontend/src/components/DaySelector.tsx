import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DAYS_OF_WEEK } from '../utils/constants';

const DaySelector = ({ selectedDay, onSelectDay, sessionCounts = {}, style }) => {
  const { theme } = useTheme();
  const today = new Date().getDay();

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {DAYS_OF_WEEK.map((day, index) => {
          const isToday = index === today;
          const isSelected = selectedDay === index;
          const sessionCount = sessionCounts[index] || 0;
          const currentDay = new Date().getDay();
          const dayDate = new Date(Date.now() + (index - currentDay) * 86400000);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const isFutureOrToday = dayDate >= todayDate;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
                isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                isToday && !isSelected && { borderColor: theme.primary, borderWidth: 2 },
              ]}
              onPress={() => onSelectDay(index)}
            >
              <View style={styles.dayButtonContent}>
                <Text style={[
                  styles.dayButtonTextShort,
                  { color: theme.text },
                  isSelected && { color: '#fff' },
                  isToday && !isSelected && { color: theme.primary },
                ]}>
                  {day.substring(0, 3)}
                </Text>
                <Text style={[
                  styles.dayButtonDate,
                  { color: theme.textSecondary },
                  isSelected && { color: '#fff' },
                ]}>
                  {dayDate.getDate()}
                </Text>
              </View>
              {sessionCount > 0 && isFutureOrToday && (
                <View style={[
                  styles.sessionCountBadge,
                  { backgroundColor: theme.warning },
                  isSelected && { backgroundColor: theme.primary },
                ]}>
                  <Text style={[
                    styles.sessionCountText,
                    { color: '#fff' },
                    isSelected && { color: theme.text },
                  ]}>
                    {sessionCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  daySelector: {
    paddingVertical: 12,
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dayButton: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  dayButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dayButtonTextShort: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayButtonDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  sessionCountText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default DaySelector;
