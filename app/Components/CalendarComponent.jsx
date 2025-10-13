import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const CalendarComponent = ({ data, cycleData }) => {
  console.log('📅 Calendar data received:', data?.length, 'entries');
  console.log('📅 Cycle data for calendar:', cycleData);

  const getPeriodAndFertileDays = () => {
    if (!cycleData || !cycleData.lastPeriodDate) {
      console.log('❌ No cycle data available for predictions');
      return { periodDays: [], fertileDays: [] };
    }

    const { 
      lastPeriodDate, 
      periodDays, 
      fertileStartDay, 
      fertileEndDay,
      nextPeriodDate,
      previousPeriodDate
    } = cycleData;
    
    const periodDates = [];
    const fertileDates = [];

    console.log('🩸 PERIOD CALCULATION DEBUG:');
    console.log('- Last period date:', lastPeriodDate.toLocaleDateString());
    console.log('- Period duration (days):', periodDays);
    console.log('- Next period date:', nextPeriodDate?.toLocaleDateString());
    console.log('- Previous period date:', previousPeriodDate?.toLocaleDateString());

    // 🩸 FIXED: Calculate LAST period dates (CURRENT period)
    if (lastPeriodDate) {
      console.log('🩸 Calculating CURRENT period dates:');
      for (let i = 0; i < periodDays; i++) {
        const periodDate = new Date(lastPeriodDate);
        periodDate.setDate(lastPeriodDate.getDate() + i);
        const dateString = periodDate.toISOString().split('T')[0];
        periodDates.push(dateString);
        console.log(`  Day ${i+1}: ${dateString}`);
      }
    }

    // 🩸 FIXED: Calculate PREVIOUS period dates
    if (previousPeriodDate) {
      console.log('🩸 Calculating PREVIOUS period dates:');
      for (let i = 0; i < periodDays; i++) {
        const periodDate = new Date(previousPeriodDate);
        periodDate.setDate(previousPeriodDate.getDate() + i);
        const dateString = periodDate.toISOString().split('T')[0];
        // Only add if not already in the array
        if (!periodDates.includes(dateString)) {
          periodDates.push(dateString);
          console.log(`  Day ${i+1}: ${dateString}`);
        }
      }
    }

    // 🩸 FIXED: Calculate NEXT period dates (predicted)
    if (nextPeriodDate) {
      console.log('🩸 Calculating NEXT period dates:');
      for (let i = 0; i < periodDays; i++) {
        const periodDate = new Date(nextPeriodDate);
        periodDate.setDate(nextPeriodDate.getDate() + i);
        const dateString = periodDate.toISOString().split('T')[0];
        // Only add if not already in the array
        if (!periodDates.includes(dateString)) {
          periodDates.push(dateString);
          console.log(`  Day ${i+1}: ${dateString}`);
        }
      }
    }

    console.log('✅ FINAL PERIOD DATES:', periodDates);

    // 🎯 Calculate fertile days for current cycle
    if (lastPeriodDate) {
      console.log('🎯 Calculating CURRENT fertile window:');
      for (let i = fertileStartDay - 1; i < fertileEndDay; i++) {
        const fertileDate = new Date(lastPeriodDate);
        fertileDate.setDate(lastPeriodDate.getDate() + i);
        const dateString = fertileDate.toISOString().split('T')[0];
        fertileDates.push(dateString);
        console.log(`  Fertile Day ${i+1}: ${dateString}`);
      }
    }

    // 🎯 Calculate fertile days for next cycle
    if (nextPeriodDate) {
      console.log('🎯 Calculating NEXT fertile window:');
      for (let i = fertileStartDay - 1; i < fertileEndDay; i++) {
        const fertileDate = new Date(nextPeriodDate);
        fertileDate.setDate(nextPeriodDate.getDate() + i);
        const dateString = fertileDate.toISOString().split('T')[0];
        if (!fertileDates.includes(dateString)) {
          fertileDates.push(dateString);
          console.log(`  Fertile Day ${i+1}: ${dateString}`);
        }
      }
    }

    console.log('✅ FINAL FERTILE DATES:', fertileDates);

    return {
      periodDays: periodDates,
      fertileDays: fertileDates
    };
  };

  const getMarkedDates = () => {
    const markedDates = {};
    const { periodDays, fertileDays } = getPeriodAndFertileDays();

    console.log('🎯 FINAL MARKING:');
    console.log('- Period days to mark:', periodDays.length);
    console.log('- Fertile days to mark:', fertileDays.length);
    console.log('- Sample period dates:', periodDays.slice(0, 5));

    // 🩸 Mark PERIOD days (pink background)
    periodDays.forEach(date => {
      markedDates[date] = {
        customStyles: {
          container: {
            backgroundColor: '#FDF2F8',
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
    });

    // 🎯 Mark FERTILE days (blue background)
    fertileDays.forEach(date => {
      if (!markedDates[date]) {
        markedDates[date] = {
          customStyles: {
            container: {
              backgroundColor: '#F0F9FF',
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#0EA5E9',
            },
            text: {
              color: '#0EA5E9',
              fontWeight: 'bold',
            }
          }
        };
      } else {
        // If both period and fertile (shouldn't happen normally), prioritize period
        markedDates[date] = {
          ...markedDates[date],
          customStyles: {
            container: {
              backgroundColor: '#FDF2F8', // Keep period background
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#EC4899', // Keep period border
            },
            text: {
              color: '#EC4899',
              fontWeight: 'bold',
            }
          }
        };
      }
    });

    // 📝 Add user tracking data (dots for bleeding and moods)
    if (data && data.length > 0) {
      console.log('📝 Adding user tracking data dots...');
      data.forEach(entry => {
        if (entry.date) {
          let dotColor = '#E5E7EB';
          
          if (entry.bleeding) {
            switch (entry.bleeding.id) {
              case 'light':
                dotColor = '#FFB6C1';
                break;
              case 'medium':
                dotColor = '#FF69B4';
                break;
              case 'heavy':
                dotColor = '#DC143C';
                break;
              case 'spotting':
                dotColor = '#FFE4E1';
                break;
              case 'none':
                dotColor = '#E5E7EB';
                break;
              default:
                dotColor = '#E5E7EB';
            }
          }

          if (markedDates[entry.date]) {
            markedDates[entry.date] = {
              ...markedDates[entry.date],
              dots: [
                {
                  key: 'bleeding',
                  color: dotColor,
                  selectedDotColor: dotColor,
                },
                ...(entry.moods && entry.moods.length > 0 ? [{
                  key: 'mood',
                  color: '#8B5CF6',
                  selectedDotColor: '#8B5CF6',
                }] : [])
              ]
            };
          } else {
            markedDates[entry.date] = {
              selected: true,
              selectedColor: '#F3F4F6',
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
                ...(entry.moods && entry.moods.length > 0 ? [{
                  key: 'mood',
                  color: '#8B5CF6',
                  selectedDotColor: '#8B5CF6',
                }] : [])
              ]
            };
          }
        }
      });
    }

    // 🔵 Mark TODAY with special styling
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today is:', today);
    if (markedDates[today]) {
      markedDates[today] = {
        ...markedDates[today],
        customStyles: {
          ...markedDates[today].customStyles,
          container: {
            ...markedDates[today].customStyles.container,
            borderWidth: 3,
            borderColor: '#10B981',
          }
        }
      };
    } else {
      markedDates[today] = {
        customStyles: {
          container: {
            borderRadius: 8,
            borderWidth: 3,
            borderColor: '#10B981',
            backgroundColor: '#F0FDF4',
          },
          text: {
            color: '#10B981',
            fontWeight: 'bold',
          }
        }
      };
    }

    console.log('✅ FINAL: Total marked dates:', Object.keys(markedDates).length);
    return markedDates;
  };

  // Configure calendar locale
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
          <Text style={styles.placeholderEmoji}>📅</Text>
          <Text style={styles.placeholderText}>No tracking data yet</Text>
          <Text style={styles.placeholderSubtext}>Start tracking your feelings to see your cycle history</Text>
        </View>
      </View>
    );
  }

  const markedDates = getMarkedDates();

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
          todayTextColor: '#10B981',
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
        markingType={'custom'}
        markedDates={markedDates}
        hideExtraDays={true}
        showWeekNumbers={false}
        onDayPress={(day) => {
          console.log('Selected day:', day);
        }}
      />

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Calendar Legend:</Text>
        
        <View style={styles.legendSection}>
          <Text style={styles.legendSubtitle}>Cycle Phases:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FDF2F8', borderColor: '#EC4899', borderWidth: 2 }]} />
              <Text style={styles.legendText}>Period Days</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F0F9FF', borderColor: '#0EA5E9', borderWidth: 2 }]} />
              <Text style={styles.legendText}>Fertile Window</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F0FDF4', borderColor: '#10B981', borderWidth: 3 }]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>

        <View style={styles.legendSection}>
          <Text style={styles.legendSubtitle}>Bleeding Levels:</Text>
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
          </View>
        </View>

        <View style={styles.legendSection}>
          <Text style={styles.legendSubtitle}>Other:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Mood</Text>
            </View>
          </View>
        </View>
      </View>

      {cycleData && (
        <View style={styles.cycleSummary}>
          <Text style={styles.summaryTitle}>Current Cycle Info:</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Day {cycleData.currentDay} of {cycleData.totalDays}</Text>
            <Text style={styles.summaryText}>
              {cycleData.currentDay <= cycleData.periodDays ? '🩸 Period' : 
               cycleData.isFertile ? '🎯 Fertile' : '📅 Regular'}
            </Text>
          </View>
          {cycleData.lastPeriodDate && (
            <Text style={styles.summaryText}>
              Last period: {cycleData.lastPeriodDate.toLocaleDateString()}
            </Text>
          )}
          {cycleData.nextPeriodDate && (
            <Text style={styles.summaryText}>
              Next period: ~{cycleData.nextPeriodDate.toLocaleDateString()} 
              ({cycleData.daysUntilNextPeriod} days)
            </Text>
          )}
        </View>
      )}

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          📊 {data.length} tracking entr{data.length === 1 ? 'y' : 'ies'} • 
          🩸 {data.filter(d => d.bleeding && d.bleeding.id !== 'none').length} bleeding days • 
          😊 {data.filter(d => d.moods && d.moods.length > 0).length} mood entries
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
  placeholderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  placeholderSubtext: {
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendSection: {
    marginBottom: 12,
  },
  legendSubtitle: {
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
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cycleSummary: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  summary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default CalendarComponent;