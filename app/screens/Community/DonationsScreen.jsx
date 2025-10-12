import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const DonationsScreen = ({ navigation }) => {
  const [donationDetails, setDonationDetails] = useState({
    name: '',
    message: '',
    amount: ''
  });
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleDonation = async () => {
    // Validate donation details
    if (!isAnonymous && !donationDetails.name) {
      Alert.alert('Error', 'Please enter your name or select anonymous donation');
      return;
    }

    if (!donationDetails.amount) {
      Alert.alert('Error', 'Please enter donation amount');
      return;
    }

    // Validate amount is a positive number
    const amount = parseFloat(donationDetails.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid donation amount');
      return;
    }

    // Navigate to PaymentScreen with donation details
    navigation.navigate('PaymentScreen', {
      donationDetails: {
        ...donationDetails,
        amount: amount,
        isAnonymous: isAnonymous
      }
    });
  };

  const formatAmount = (text) => {
    // Remove all non-digits except decimal point
    const cleaned = text.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Donations</Text>
          <Text style={styles.headerSubtitle}>Make a Difference Together</Text>
        </View>

        {/* Donation Form */}
        <View style={styles.formContainer}>
          {/* Introduction Paragraph */}
          <View style={styles.introContainer}>
            <View style={styles.heartIcon}>
              <Text style={styles.heartIconText}>❤️</Text>
            </View>
            <Text style={styles.introText}>
              Period Pal is an app designed to help people who need the assistance of others. By donating here, we can help those in need. As community managers, we will ensure that your donations reach them. Your help is much appreciated.
            </Text>
          </View>

          {/* Donor Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>👤</Text>
              </View>
              <Text style={styles.sectionTitle}>Donor Information</Text>
            </View>
            
            {/* Donor's Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Donor's Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  isAnonymous && styles.disabledInput
                ]}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                value={donationDetails.name}
                onChangeText={(text) => setDonationDetails({...donationDetails, name: text})}
                autoCapitalize="words"
                editable={!isAnonymous}
              />
            </View>

            {/* Anonymous Donation Switch */}
            <View style={styles.switchContainer}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Anonymous Donation</Text>
                <Text style={styles.switchDescription}>
                  Your name will not be displayed publicly
                </Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#E5E7EB', true: '#EC4899' }}
                thumbColor={isAnonymous ? '#fcd2e7ff' : '#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>

            {/* Optional Message */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Message (Optional)</Text>
                <Text style={styles.optionalText}>Optional</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                placeholder="Share an encouraging message..."
                placeholderTextColor="#9CA3AF"
                value={donationDetails.message}
                onChangeText={(text) => setDonationDetails({...donationDetails, message: text})}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Donation Amount */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount (LKR)</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>LKR</Text>
                <TextInput
                  style={[styles.textInput, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={donationDetails.amount}
                  onChangeText={(text) => setDonationDetails({...donationDetails, amount: formatAmount(text)})}
                  keyboardType="decimal-pad"
                />
              </View>
              
              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountsContainer}>
                <Text style={styles.quickAmountsLabel}>Quick Amounts</Text>
                <View style={styles.quickAmountsRow}>
                  {[500, 1000, 2000, 5000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.quickAmountButton}
                      onPress={() => setDonationDetails({...donationDetails, amount: amount.toString()})}
                    >
                      <Text style={styles.quickAmountText}>LKR {amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleDonation}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Text style={styles.continueButtonSubtext}>Proceed to Payment</Text>
            </View>
          </TouchableOpacity>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>🔒 Your donation is secure and protected</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EC4899',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    minHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  introContainer: {
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heartIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  heartIconText: {
    fontSize: 18,
  },
  introText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionalText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    color: '#9CA3AF',
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  switchDescription: {
    color: '#6B7280',
    fontSize: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    backgroundColor: '#EC4899',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0,
  },
  quickAmountsContainer: {
    marginTop: 12,
  },
  quickAmountsLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  quickAmountText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#EC4899',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#ec489ab0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  continueButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  securityBadge: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  securityText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DonationsScreen;