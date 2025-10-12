import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const CycleCircle = ({ 
  periodDays = 5, 
  fertileDays = 6, 
  totalDays = 28,
  currentDay = 14,
  fertileStartDay = 10,
  fertileEndDay = 16
}) => {
  const size = 280;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;
  
  const indicatorAnimation = useRef(new Animated.Value(0)).current;
  
  const periodArc = (periodDays / totalDays) * circumference;
  const fertileArc = (fertileDays / totalDays) * circumference;
  const otherArc = circumference - periodArc - fertileArc;

  console.log('CycleCircle - Period arc:', periodArc, 'Fertile arc:', fertileArc, 'Other arc:', otherArc);
  console.log('CycleCircle - Current day:', currentDay, 'Total days:', totalDays);

  const currentAngle = ((currentDay - 1) / totalDays) * 360;
  
  console.log('CycleCircle - Current angle:', currentAngle);

  useEffect(() => {
    Animated.timing(indicatorAnimation, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [currentDay]);

  const indicatorRotation = indicatorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${currentAngle}deg`],
  });

  const textRotation = indicatorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${-currentAngle}deg`],
  });

  const periodDashOffset = 0;
  const fertileDashOffset = periodArc;
  const otherDashOffset = periodArc + fertileArc;

  return (
    <View style={styles.container}>
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#f8f9fa"
            strokeWidth={strokeWidth}
            fill="none"
          />

          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#e9ecef"
            strokeWidth={strokeWidth}
            strokeDasharray={`${otherArc} ${circumference}`}
            strokeDashoffset={otherDashOffset}
            strokeLinecap="round"
            fill="none"
            origin={`${center}, ${center}`}
          />

          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#74c0fc"
            strokeWidth={strokeWidth}
            strokeDasharray={`${fertileArc} ${circumference}`}
            strokeDashoffset={fertileDashOffset}
            strokeLinecap="round"
            fill="none"
            origin={`${center}, ${center}`}
          />

          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#ff8787"
            strokeWidth={strokeWidth}
            strokeDasharray={`${periodArc} ${circumference}`}
            strokeDashoffset={periodDashOffset}
            strokeLinecap="round"
            fill="none"
            origin={`${center}, ${center}`}
          />
        </Svg>
        
        <Animated.View 
          style={[
            styles.indicatorContainer,
            { 
              transform: [
                { rotate: indicatorRotation }
              ] 
            }
          ]}
        >
          <View style={styles.indicatorLine} />
          <View style={styles.indicatorDot}>
            <Animated.Text style={[
              styles.indicatorText,
              { 
                transform: [
                  { rotate: textRotation }
                ] 
              }
            ]}>
              {currentDay}
            </Animated.Text>
          </View>
        </Animated.View>
        
        <View style={styles.centerContent}>
          <Text style={styles.dayNumber}>{currentDay}</Text>
          <Text style={styles.dayLabel}>Day {currentDay}</Text>
          <Text style={styles.totalDays}>of {totalDays}</Text>
          <Text style={styles.cyclePhase}>
            {currentDay <= periodDays ? '🩸 Period' : 
             currentDay >= fertileStartDay && currentDay <= fertileEndDay ? '🎯 Fertile' : 
             '📅 Regular'}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: '#ff8787' }]} />
          <Text style={styles.legendText}>Period (Day 1-{periodDays})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: '#74c0fc' }]} />
          <Text style={styles.legendText}>Fertile (Day {fertileStartDay}-{fertileEndDay})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: '#e9ecef' }]} />
          <Text style={styles.legendText}>Other Days</Text>
        </View>
      </View>

      <View style={styles.cycleInfo}>
        <Text style={styles.cycleInfoText}>
          {currentDay <= periodDays ? '🩸 Currently in period phase' : 
           currentDay >= fertileStartDay && currentDay <= fertileEndDay ? '🎯 Currently in fertile window' : 
           '📅 Regular cycle phase'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  dayNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#495057',
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 16,
    color: '#868e96',
    fontWeight: '500',
    marginBottom: 2,
  },
  totalDays: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 4,
  },
  cyclePhase: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 4,
  },
  indicatorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  indicatorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#4c6ef5',
    marginTop: 10,
  },
  indicatorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4c6ef5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4c6ef5',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  cycleInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minWidth: '80%',
  },
  cycleInfoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CycleCircle;