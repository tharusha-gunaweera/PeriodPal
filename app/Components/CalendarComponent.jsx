import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const CalendarComponent = ({ data }) => {
  console.log('Calendar data received:', data?.length, 'entries');

  // Convert our data to the format react-native-calendars expects
  const getMarkedDates = () => {
    const markedDates = {};

    if (data && data.length > 0) {
      data.forEach(entry => {
        if (entry.date) {
          let dotColor = '#E5E7EB'; // Default gray for no bleeding
          let selectedColor = '#F3F4F6'; // Default selection color
          
          // Set color based on bleeding level
          if (entry.bleeding) {
            switch (entry.bleeding.id) {
              case 'light':
                dotColor = '#FFB6C1';
                selectedColor = '#FFF0F3';
                break;
              case 'medium':
                dotColor = '#FF69B4';
                selectedColor = '#FFE4EC';
                break;
              case 'heavy':
                dotColor = '#DC143C';
                selectedColor = '#FFE4E6';
                break;
              case 'spotting':
                dotColor = '#FFE4E1';
                selectedColor = '#FFF0EE';
                break;
              default:
                dotColor = '#E5E7EB';
            }
          }

          // Get mood emoji
          const moodEmoji = entry.moodEmoji || '😐';

          markedDates[entry.date] = {
            selected: true,
            selectedColor: selectedColor,
            selectedTextColor: '#1F2937',
            customStyles: {
              container: {
                borderRadius: 8,
              },
              text: {
                fontWeight: '600',
              }
            },
            dots: [
              {
                key: 'bleeding',
                color: dotColor,
                selectedDotColor: dotColor,
              },
              {
                key: 'mood',
                color: '#8B5CF6', // Purple for mood
                selectedDotColor: '#8B5CF6',
              }
            ],
            // Store additional data for custom rendering if needed
            bleeding: entry.bleeding,
            mood: moodEmoji
          };
        }
      });
    }

    // Mark today
    const today = new Date().toISOString().split('T')[0];
    markedDates[today] = {
      ...markedDates[today],
      selected: true,
      selectedColor: '#FDF2F8',
      selectedTextColor: '#EC4899',
      customStyles: {
        container: {
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#EC4899',
        },
        text: {
          color: '#EC4899',
          fontWeight: 'bold',
        }
      }
    };

    return markedDates;
  };

  // Configure locale (optional)
  LocaleConfig.locales['en'] = {
    monthNames: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    monthNamesShort: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    dayNames: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    today: 'Today'
  };
  LocaleConfig.defaultLocale = 'en';

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cycle Calendar</Text>
        <View style={styles.placeholder}>
          <Text>📅</Text>
          <Text style={styles.placeholderText}>No tracking data yet</Text>
          <Text style={styles.placeholderSubtext}>Start tracking your feelings to see your cycle history</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cycle Calendar</Text>
      
      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#6B7280',
          selectedDayBackgroundColor: '#EC4899',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#EC4899',
          dayTextColor: '#1F2937',
          textDisabledColor: '#D1D5DB',
          dotColor: '#EC4899',
          selectedDotColor: '#ffffff',
          arrowColor: '#EC4899',
          monthTextColor: '#1F2937',
          indicatorColor: '#EC4899',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        markingType={'multi-dot'}
        markedDates={getMarkedDates()}
        hideExtraDays={true}
        showWeekNumbers={false}
        onDayPress={(day) => {
          console.log('Selected day:', day);
        }}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Bleeding Levels:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFB6C1' }]} />
            <Text style={styles.legendText}>Light</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF69B4' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#DC143C' }]} />
            <Text style={styles.legendText}>Heavy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFE4E1' }]} />
            <Text style={styles.legendText}>Spotting</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Mood</Text>
          </View>
        </View>
      </View>

      {/* Data Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          📊 You have {data.length} tracking entr{data.length === 1 ? 'y' : 'ies'} 
          {data.filter(d => d.bleeding && d.bleeding.id !== 'none').length > 0 && 
            ` (${data.filter(d => d.bleeding && d.bleeding.id !== 'none').length} with bleeding)`
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  placeholder: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  placeholderText: {
    marginTop: 8,
    color: '#6B7280',
    fontWeight: '500',
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  legend: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
  summary: {
    marginTop: 12,
  },
  summaryText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CalendarComponent;