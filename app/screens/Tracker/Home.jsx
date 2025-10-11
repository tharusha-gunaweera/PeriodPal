import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../FirebaseConfig';
import CycleCircle from '../../Components/CycleCircle';
import FeelingTracker from '../../Components/FeelingTracker';
import CalendarComponent from '../../Components/CalendarComponent';

export default function Home() {
  const [showFeelingTracker, setShowFeelingTracker] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [hasData, setHasData] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      console.log('Loading user data for:', currentUser?.uid);
      
      if (!currentUser) {
        setUserData(null);
        setHasData(false);
        setLoading(false);
        return;
      }

      const feelingsRef = collection(db, 'userFeelings');
      const q = query(feelingsRef, where('userId', '==', currentUser.uid));
      
      const querySnapshot = await getDocs(q);
      
      console.log('Found documents:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('No user data found');
        setUserData(null);
        setHasData(false);
        setCycleData(null);
        setCalendarData([]);
      } else {
        const feelingsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          feelingsData.push({
            id: doc.id,
            ...data
          });
        });

        // Sort by timestamp (newest first)
        feelingsData.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('Processed feelings data:', feelingsData.length);
        setUserData(feelingsData);
        
        // Process for cycle and calendar
        processUserData(feelingsData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData(null);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const processUserData = (feelingsData) => {
    console.log('Processing user data for cycle prediction...');
    
    // Always create calendar data if we have any feelings
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

    // Try to calculate cycle data
    const cycleInfo = calculateCycleData(feelingsData);
    if (cycleInfo) {
      setCycleData(cycleInfo);
      console.log('Cycle data calculated:', cycleInfo);
    } else {
      // Set default cycle data for new users with some tracking
      setCycleData({
        periodDays: 5,
        fertileDays: 6,
        totalDays: 28,
        currentDay: 1,
        daysUntilNextPeriod: 28,
        isPrediction: false
      });
      console.log('Using default cycle data');
    }
  };

  const calculateCycleData = (feelingsData) => {
    // Get all bleeding days (excluding 'none')
    const bleedingDays = feelingsData
      .filter(f => f.bleeding && f.bleeding.id !== 'none')
      .sort((a, b) => a.timestamp - b.timestamp);

    console.log('Bleeding days found:', bleedingDays.length);

    // If we have at least 2 bleeding events, try to predict
    if (bleedingDays.length >= 2) {
      const recentPeriods = bleedingDays.slice(-3); // Get last 3 periods
      
      let totalCycleLength = 0;
      let cycleCount = 0;

      // Calculate gaps between consecutive periods
      for (let i = 1; i < recentPeriods.length; i++) {
        const daysBetween = Math.round(
          (recentPeriods[i].timestamp - recentPeriods[i-1].timestamp) / (1000 * 60 * 60 * 24)
        );
        
        // Only count reasonable cycle lengths (21-35 days)
        if (daysBetween >= 21 && daysBetween <= 35) {
          totalCycleLength += daysBetween;
          cycleCount++;
        }
      }

      if (cycleCount > 0) {
        const avgCycleLength = Math.round(totalCycleLength / cycleCount);
        const lastPeriod = recentPeriods[recentPeriods.length - 1];
        const today = new Date();
        const daysSinceLastPeriod = Math.floor(
          (today.getTime() - lastPeriod.timestamp) / (1000 * 60 * 60 * 24)
        );
        
        const currentDay = (daysSinceLastPeriod % avgCycleLength) + 1;
        const daysUntilNextPeriod = avgCycleLength - daysSinceLastPeriod;

        return {
          periodDays: 5, // Could be calculated from history
          fertileDays: 6,
          totalDays: avgCycleLength,
          currentDay: Math.max(1, Math.min(currentDay, avgCycleLength)),
          daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod),
          isPrediction: true
        };
      }
    }

    // If not enough data for prediction, return null
    return null;
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

  const handleSaveFeeling = async (feelingData) => {
    if (!currentUser) {
      Alert.alert('Error', 'Please log in to save your feelings');
      return;
    }

    try {
      await addDoc(collection(db, 'userFeelings'), {
        ...feelingData,
        userId: currentUser.uid,
        timestamp: Date.now()
      });

      Alert.alert('Success', 'Your feelings have been saved!');
      loadUserData(); // Reload to update display
    } catch (error) {
      console.error('Error saving feeling:', error);
      Alert.alert('Error', 'Failed to save your feelings');
    }
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

      {/* Debug Info - Remove in production */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Data Status: {hasData ? `✅ ${userData?.length} entries` : '❌ No data'}
          {cycleData && ` | Cycle Day: ${cycleData.currentDay}`}
        </Text>
      </View>

      {/* Show content if user has any tracking data */}
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
              />
              {!cycleData.isPrediction && (
                <Text style={styles.predictionNote}>
                  🔄 Track more days to get accurate predictions
                </Text>
              )}
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
          {calendarData.length > 0 && (
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>Your Cycle Calendar</Text>
              <CalendarComponent data={calendarData} />
            </View>
          )}

          {/* Recent Entries */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Tracking</Text>
            {userData?.slice(0, 5).map((entry, index) => (
              <View key={index} style={styles.entryItem}>
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
            Tap the "How are you feeling today?" button to get started!
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
  debugInfo: {
    backgroundColor: '#E8F4FD',
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  debugText: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'monospace',
  },
  circleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  predictionNote: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 8,
    fontStyle: 'italic',
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
  },
});