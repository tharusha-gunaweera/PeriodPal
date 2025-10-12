import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarComponent from '../../Components/CalendarComponent';
import CycleCircle from '../../Components/CycleCircle';
import FeelingTracker from '../../Components/FeelingTracker';

const STORAGE_KEYS = {
  USER_FEELINGS: 'userFeelings',
  CYCLE_SETTINGS: 'cycleSettings'
};

export default function Home({ navigation }) { // 🆕 Added navigation prop
  const [showFeelingTracker, setShowFeelingTracker] = useState(false);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('Loading user data from local storage...');
      
      const storedFeelings = await AsyncStorage.getItem(STORAGE_KEYS.USER_FEELINGS);
      const feelingsData = storedFeelings ? JSON.parse(storedFeelings) : [];
      
      console.log('Loaded feelings data:', feelingsData.length, 'entries');
      
      setUserData(feelingsData);
      
      if (feelingsData.length > 0) {
        processUserData(feelingsData);
        setHasData(true);
      } else {
        setHasData(false);
        setCycleData(null);
        setCalendarData([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeeling = async (feelingData) => {
    try {
      const newFeeling = {
        ...feelingData,
        id: Date.now().toString(),
        timestamp: Date.now()
      };

      // Get existing data
      const storedFeelings = await AsyncStorage.getItem(STORAGE_KEYS.USER_FEELINGS);
      const feelingsData = storedFeelings ? JSON.parse(storedFeelings) : [];
      
      // Add new feeling
      const updatedFeelings = [newFeeling, ...feelingsData];
      
      // Save back to storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER_FEELINGS, JSON.stringify(updatedFeelings));
      
      Alert.alert('Success', 'Your feelings have been saved!');
      loadUserData(); // Reload to update display
    } catch (error) {
      console.error('Error saving feeling:', error);
      Alert.alert('Error', 'Failed to save your feelings');
    }
  };

  // 🎯 ACCURATE: Process user data with real cycle calculations
  const processUserData = (feelingsData) => {
    console.log('Processing user data for cycle prediction...');
    
    // Create calendar data
    if (feelingsData.length > 0) {
      const calendarEntries = feelingsData.map(feeling => ({
        date: new Date(feeling.timestamp).toISOString().split('T')[0],
        bleeding: feeling.bleeding,
        moods: feeling.moods,
        moodEmoji: getMoodEmoji(feeling.moods),
        timestamp: feeling.timestamp
      }));
      
      console.log('Calendar entries created:', calendarEntries.length);
      setCalendarData(calendarEntries);
      setHasData(true);
    }

    // Calculate accurate cycle data
    const cycleInfo = calculateAccurateCycleData(feelingsData);
    if (cycleInfo) {
      setCycleData(cycleInfo);
      console.log('Cycle data calculated:', cycleInfo);
    } else {
      // Set default cycle data for new users
      setCycleData({
        periodDays: 5,
        fertileDays: 6,
        totalDays: 28,
        currentDay: 1,
        daysUntilNextPeriod: 28,
        nextPeriodDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        fertileStartDay: 10,
        fertileEndDay: 16,
        isFertile: false,
        isPrediction: false,
        lastPeriodDate: null
      });
      console.log('Using default cycle data');
    }
  };

const calculateAccurateCycleData = (feelingsData) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  console.log('Today:', today.toLocaleDateString());

  // Get all period days (bleeding that's not 'none') sorted by date
  const periodDays = feelingsData
    .filter(f => f.bleeding && f.bleeding.id !== 'none')
    .sort((a, b) => a.timestamp - b.timestamp);

  console.log('Period days found:', periodDays.length);

  if (periodDays.length === 0) {
    // No period data available - use default 28-day cycle
    const nextPeriodDate = new Date(todayStart + 28 * 24 * 60 * 60 * 1000);
    return {
      periodDays: 5,
      fertileDays: 6,
      totalDays: 28,
      currentDay: 1,
      daysUntilNextPeriod: 28,
      nextPeriodDate: nextPeriodDate,
      fertileStartDay: 10,
      fertileEndDay: 16,
      isFertile: false,
      isPrediction: false,
      lastPeriodDate: null
    };
  }

  // Calculate average cycle length from historical data
  let cycleLengths = [];
  for (let i = 1; i < periodDays.length; i++) {
    const daysBetween = Math.round(
      (periodDays[i].timestamp - periodDays[i-1].timestamp) / (1000 * 60 * 60 * 24)
    );
    
    if (daysBetween >= 21 && daysBetween <= 35) {
      cycleLengths.push(daysBetween);
    }
  }

  const avgCycleLength = cycleLengths.length > 0 
    ? Math.round(cycleLengths.reduce((a, b) => a + b) / cycleLengths.length)
    : 28;

  const lastPeriod = periodDays[periodDays.length - 1];
  const lastPeriodDate = new Date(lastPeriod.timestamp);
  
  // 🎯 FIXED: Calculate current cycle day based on last period and today
  const daysSinceLastPeriod = Math.floor(
    (todayStart - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentDay = (daysSinceLastPeriod % avgCycleLength) + 1;
  const daysUntilNextPeriod = avgCycleLength - daysSinceLastPeriod;
  
  // 🎯 FIXED: Calculate next period date
  const nextPeriodDate = new Date(lastPeriodDate);
  nextPeriodDate.setDate(lastPeriodDate.getDate() + avgCycleLength);
  
  // 🎯 FIXED: Calculate previous period date for complete cycle visualization
  const previousPeriodDate = new Date(lastPeriodDate);
  previousPeriodDate.setDate(lastPeriodDate.getDate() - avgCycleLength);
  
  // 🎯 FIXED: Fertile window (typically days 10-16 of cycle)
  const fertileStartDay = 10;
  const fertileEndDay = 16;
  const isFertile = currentDay >= fertileStartDay && currentDay <= fertileEndDay;

  // Calculate average period length from historical data
  const periodLengths = [];
  let currentPeriod = [];
  
  for (let i = 0; i < periodDays.length; i++) {
    if (i === 0 || periodDays[i].timestamp - periodDays[i-1].timestamp <= 2 * 24 * 60 * 60 * 1000) {
      currentPeriod.push(periodDays[i]);
    } else {
      if (currentPeriod.length > 0) {
        periodLengths.push(currentPeriod.length);
      }
      currentPeriod = [periodDays[i]];
    }
  }
  if (currentPeriod.length > 0) {
    periodLengths.push(currentPeriod.length);
  }
  
  const avgPeriodDays = periodLengths.length > 0 
    ? Math.round(periodLengths.reduce((a, b) => a + b) / periodLengths.length)
    : 5;

  console.log('Cycle calculation complete:');
  console.log('- Current day:', currentDay);
  console.log('- Total days:', avgCycleLength);
  console.log('- Period days:', avgPeriodDays);
  console.log('- Fertile window:', fertileStartDay, '-', fertileEndDay);
  console.log('- Last period:', lastPeriodDate.toLocaleDateString());
  console.log('- Next period:', nextPeriodDate.toLocaleDateString());

  return {
    periodDays: avgPeriodDays,
    fertileDays: fertileEndDay - fertileStartDay + 1,
    totalDays: avgCycleLength,
    currentDay: Math.max(1, Math.min(currentDay, avgCycleLength)),
    daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod),
    nextPeriodDate: nextPeriodDate,
    previousPeriodDate: previousPeriodDate,
    fertileStartDay: fertileStartDay,
    fertileEndDay: fertileEndDay,
    isFertile: isFertile,
    isPrediction: cycleLengths.length > 0,
    lastPeriodDate: lastPeriodDate
  };
};

  const getMoodEmoji = (moods) => {
    if (!moods || moods.length === 0) return '😐';
    
    const moodEmojis = {
      happy: '😊',
      sad: '😔',
      angry: '😠',
      anxious: '😰',
      tired: '😴',
      energetic: '💪',
      bloated: '🎈',
      cramps: '💢',
      headache: '🤕',
      normal: '😐'
    };
    
    return moodEmojis[moods[0]] || '😐';
  };

  // Clear all data (for testing)
  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_FEELINGS);
      Alert.alert('Success', 'All data cleared');
      loadUserData();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  // 🆕 Navigate to Health Tips
  const navigateToHealthTips = () => {
    navigation.navigate('HealthTips');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  console.log('Rendering - hasData:', hasData, 'userData length:', userData?.length, 'cycleData:', cycleData);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cycle Tracker</Text>
        <Text style={styles.subtitle}>
          {hasData ? 'Your current cycle progress' : 'Track your cycle to get started'}
        </Text>
      </View>

      {/* Feeling Tracker Button */}
      <TouchableOpacity
        style={styles.feelingButton}
        onPress={() => setShowFeelingTracker(true)}
      >
        <Text style={styles.feelingButtonEmoji}>😊</Text>
        <Text style={styles.feelingButtonText}>
          {hasData ? 'Update your feelings' : 'How are you feeling today?'}
        </Text>
      </TouchableOpacity>

      {/* Health Tips Button - UPDATED with navigation */}
      <TouchableOpacity
        style={styles.healthTipsButton}
        onPress={navigateToHealthTips} // 🆕 Updated to use navigation
      >
        <Text style={styles.healthTipsButtonEmoji}>💡</Text>
        <Text style={styles.healthTipsButtonText}>Visit for Health Tips</Text>
      </TouchableOpacity>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <View style={styles.debugTextContainer}>
          <Text style={styles.debugText}>
            📅 Today: {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.debugText}>
            📊 Entries: {userData.length}
          </Text>
          {cycleData && (
            <>
              <Text style={styles.debugText}>
                🔄 Day: {cycleData.currentDay}/{cycleData.totalDays}
              </Text>
              <Text style={styles.debugText}>
                ⏳ Next Period: {cycleData.daysUntilNextPeriod} days
              </Text>
              {cycleData.lastPeriodDate && (
                <Text style={styles.debugText}>
                  🩸 Last: {cycleData.lastPeriodDate.toLocaleDateString()}
                </Text>
              )}
            </>
          )}
        </View>
        <TouchableOpacity onPress={clearAllData} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Data</Text>
        </TouchableOpacity>
      </View>

      {/* Show content if user has tracking data */}
      {hasData ? (
        <>
          {/* Cycle Circle - Show if we have cycle data */}
          {cycleData && (
            <View style={styles.circleContainer}>
              <CycleCircle 
                periodDays={cycleData.periodDays} 
                fertileDays={cycleData.fertileDays} 
                totalDays={cycleData.totalDays}
                currentDay={cycleData.currentDay}
                fertileStartDay={cycleData.fertileStartDay}
                fertileEndDay={cycleData.fertileEndDay}
              />
              
              {/* Cycle Status Info */}
              <View style={styles.cycleStatus}>
                <Text style={[
                  styles.statusText,
                  cycleData.isFertile ? styles.fertileStatus : styles.regularStatus
                ]}>
                  {cycleData.isFertile ? '🎯 Fertile Window (Days 10-16)' : '📅 Regular Cycle Days'}
                </Text>
                {cycleData.nextPeriodDate && (
                  <Text style={styles.nextPeriodText}>
                    Next period: {cycleData.nextPeriodDate.toLocaleDateString()}
                  </Text>
                )}
                {!cycleData.isPrediction && (
                  <Text style={styles.predictionNote}>
                    🔄 Track more periods for accurate predictions
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Stats */}
          {cycleData && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{cycleData.daysUntilNextPeriod}</Text>
                <Text style={styles.statLabel}>Days until period</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{cycleData.currentDay}</Text>
                <Text style={styles.statLabel}>Current day</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{cycleData.totalDays}</Text>
                <Text style={styles.statLabel}>Cycle length</Text>
              </View>
            </View>
          )}

          {/* Calendar - Show if we have calendar data */}
          {calendarData.length > 0 && cycleData && (
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>Your Cycle Calendar</Text>
              <CalendarComponent data={calendarData} cycleData={cycleData} />
            </View>
          )}

          {/* Recent Entries */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Tracking</Text>
            {userData.slice(0, 5).map((entry) => (
              <View key={entry.id} style={styles.entryItem}>
                <Text style={styles.entryDate}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </Text>
                <Text style={styles.entryDetails}>
                  {entry.bleeding ? `🩸 ${entry.bleeding.label}` : ''}
                  {entry.moods && entry.moods.length > 0 && ` | ${entry.moods.map(m => getMoodEmoji([m])).join(' ')}`}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        /* Welcome message for new users */
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeEmoji}>👋</Text>
          <Text style={styles.welcomeTitle}>Welcome to Period Pal!</Text>
          <Text style={styles.welcomeText}>
            Track your feelings and symptoms to get personalized cycle predictions and insights.
          </Text>
          <Text style={styles.welcomeTip}>
            💡 Tip: Mark your bleeding days to get accurate cycle predictions!
          </Text>
        </View>
      )}

      {/* Feeling Tracker Modal */}
      <FeelingTracker
        visible={showFeelingTracker}
        onClose={() => setShowFeelingTracker(false)}
        onSave={handleSaveFeeling}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#EC4899',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  feelingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feelingButtonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  feelingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EC4899',
  },
  // Health Tips Button Styles
  healthTipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  healthTipsButtonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  healthTipsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  debugInfo: {
    backgroundColor: '#E8F4FD',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  debugTextContainer: {
    marginBottom: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  circleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  cycleStatus: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: '80%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  fertileStatus: {
    color: '#0EA5E9',
  },
  regularStatus: {
    color: '#6B7280',
  },
  nextPeriodText: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '500',
    marginBottom: 8,
  },
  predictionNote: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EC4899',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  calendarSection: {
    margin: 20,
  },
  recentSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entryDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  entryDetails: {
    fontSize: 14,
    color: '#1F2937',
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EC4899',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeTip: {
    fontSize: 14,
    color: '#8B5CF6',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
});