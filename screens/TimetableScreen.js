
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../styles/common';

// schedule data - hardcoded for now, should probably come from API
const CLASS_SCHEDULE = [
  { time: '09:00 AM', subject: 'Web Development', type: 'LAB 1', room: 'Room 200' },
  { time: '11:00 AM', subject: 'Database Systems', type: 'Lecture', room: 'Room 201' },
  { time: '01:00 PM', subject: 'UI/UX Design', type: 'LAB 2', room: 'Room 202' },
  { time: '03:00 PM', subject: 'Software Engineering', type: 'LAB 5', room: 'Room 208' },
];

// generate week dates starting from monday
// i know this could be simpler but it works
function makeWeek() {
  const today = new Date();
  const monday = new Date(today);
  const daysFromMonday = today.getDay() === 0 ? 6 : today.getDay() - 1;
  monday.setDate(today.getDate() - daysFromMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

export default function TimetableScreen() {
  // state for selected day
  const week = makeWeek();
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const selectedDate = week[selectedDay];
  const classes = selectedDay < 5 ? CLASS_SCHEDULE : []; // no classes on weekends lol

  // format week range for display
  const weekLabel = `${week[0].toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${week[6].toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* header */}
      <Text style={styles.pageTitle}>Timetable</Text>
      <Text style={styles.subtitle}>{weekLabel}</Text>

      {/* date selector - horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScroller}
        contentContainerStyle={styles.dateList}
      >
        {week.map((date, index) => {
          const isSelected = selectedDay === index;
          return (
            <Pressable
              key={date.toISOString()}
              style={[styles.dateButton, isSelected && styles.selectedDate]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[styles.dayName, isSelected && styles.selectedDateText]}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.selectedDateText]}>
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* events list */}
      <ScrollView contentContainerStyle={styles.eventsContent}>
        <Text style={styles.scheduleDate}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {classes.map((event) => (
          <View key={event.time} style={styles.eventRow}>
            <Text style={styles.eventTime}>{event.time}</Text>
            <View style={styles.eventCard}>
              <Text style={styles.eventSubject}>{event.subject}</Text>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventRoom}>{event.room}</Text>
            </View>
          </View>
        ))}
        {classes.length === 0 ? (
          <Text style={styles.noClasses}>No classes scheduled.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// styles at the bottom - keeping it consistent
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 14,
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 4,
  },
  dateList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  dateScroller: {
    flexGrow: 0,
  },
  dateButton: {
    width: 48,
    height: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDate: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 11,
    color: colors.textLight,
  },
  dayNumber: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  selectedDateText: {
    color: colors.primary,
  },
  eventsContent: {
    padding: 16,
    paddingBottom: 24,
  },
  scheduleDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  noClasses: {
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: 32,
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  eventTime: {
    width: 72,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    paddingTop: 8,
  },
  eventCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  eventSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  eventType: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  eventRoom: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
});