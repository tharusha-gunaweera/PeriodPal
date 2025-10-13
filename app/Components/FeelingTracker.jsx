import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert
} from 'react-native';

const FeelingTracker = ({ visible, onClose, onSave }) => {
  const [selectedBleeding, setSelectedBleeding] = useState(null);
  const [selectedMoods, setSelectedMoods] = useState([]);

  const bleedingOptions = [
    { id: 'none', label: 'No Bleeding', emoji: '❌' },
    { id: 'light', label: 'Light', emoji: '💧' },
    { id: 'medium', label: 'Medium', emoji: '🩸' },
    { id: 'heavy', label: 'Heavy', emoji: '🩸🩸' },
    { id: 'spotting', label: 'Spotting', emoji: '🔴' }
  ];

  const moodOptions = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'sad', label: 'Sad', emoji: '😔' },
    { id: 'angry', label: 'Angry', emoji: '😠' },
    { id: 'anxious', label: 'Anxious', emoji: '😰' },
    { id: 'tired', label: 'Tired', emoji: '😴' },
    { id: 'energetic', label: 'Energetic', emoji: '💪' },
    { id: 'bloated', label: 'Bloated', emoji: '🎈' },
    { id: 'cramps', label: 'Cramps', emoji: '💢' },
    { id: 'headache', label: 'Headache', emoji: '🤕' },
    { id: 'normal', label: 'Normal', emoji: '😐' }
  ];

  const handleBleedingSelect = (bleeding) => {
    console.log('🩸 Selected bleeding:', bleeding);
    setSelectedBleeding(bleeding);
  };

  const handleMoodSelect = (mood) => {
    setSelectedMoods(prev => {
      if (prev.includes(mood.id)) {
        return prev.filter(id => id !== mood.id);
      } else {
        return [...prev, mood.id];
      }
    });
  };

  const handleSave = () => {
    if (!selectedBleeding && selectedMoods.length === 0) {
      Alert.alert('Info', 'Please select at least one feeling or bleeding status');
      return;
    }

    const feelingData = {
      bleeding: selectedBleeding,
      moods: selectedMoods,
      date: new Date().toISOString().split('T')[0], // Ensure date format is correct
      timestamp: Date.now()
    };

    console.log('💾 Saving feeling data:', feelingData);
    onSave(feelingData);
    setSelectedBleeding(null);
    setSelectedMoods([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedBleeding(null);
    setSelectedMoods([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>How Are You Feeling Today?</Text>
          
          <ScrollView style={styles.scrollContainer}>
            {/* Bleeding Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🩸 Bleeding Status</Text>
              <Text style={styles.sectionSubtitle}>Select your current bleeding level</Text>
              <View style={styles.optionsGrid}>
                {bleedingOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedBleeding?.id === option.id && styles.optionButtonSelected
                    ]}
                    onPress={() => handleBleedingSelect(option)}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.optionLabel,
                      selectedBleeding?.id === option.id && styles.optionLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Moods Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>😊 How Do You Feel?</Text>
              <Text style={styles.sectionSubtitle}>Select all that apply</Text>
              <View style={styles.optionsGrid}>
                {moodOptions.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.optionButton,
                      selectedMoods.includes(mood.id) && styles.optionButtonSelected
                    ]}
                    onPress={() => handleMoodSelect(mood)}
                  >
                    <Text style={styles.optionEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.optionLabel,
                      selectedMoods.includes(mood.id) && styles.optionLabelSelected
                    ]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Feelings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC4899',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    minWidth: 80,
  },
  optionButtonSelected: {
    backgroundColor: '#FDF2F8',
    borderColor: '#EC4899',
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#EC4899',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeelingTracker;