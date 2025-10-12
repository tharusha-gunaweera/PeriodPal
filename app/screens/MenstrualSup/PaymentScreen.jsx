import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

const PaymentScreen = ({ route, navigation }) => {
  // Get order details from navigation parameters
  const { orderDetails } = route.params || {};

  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // Validate card details
    if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    // Validate billing address
    if (!billingAddress.address || !billingAddress.city || !billingAddress.state || !billingAddress.postalCode) {
      Alert.alert('Error', 'Please fill in all billing address fields');
      return;
    }

    // Validate card number (exactly 12 digits)
    if (!/^\d{12}$/.test(cardDetails.number.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Card number must be exactly 12 digits');
      return;
    }

    // Validate expiry date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      Alert.alert('Error', 'Expiry date must be in MM/YY format');
      return;
    }

    // Validate CVV (3 digits)
    if (!/^\d{3}$/.test(cardDetails.cvv)) {
      Alert.alert('Error', 'CVV must be 3 digits');
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message with order details
      Alert.alert(
        'Payment Successful!', 
        `Thank you for your order of LKR ${orderDetails?.totalAmount?.toLocaleString()}. Your items will be delivered ${orderDetails?.isUrgent ? 'within 24 hours' : 'soon'}.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Shop') // Navigate back to shop
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 12 digits and format with spaces every 4 digits
    const formatted = cleaned.slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiry = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Format as MM/YY
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Calculate item count for display
  const getItemCount = () => {
    if (!orderDetails?.items) return 0;
    return Object.values(orderDetails.items).reduce((sum, item) => sum + item.quantity, 0);
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
          <Text style={styles.headerTitle}>Online Card Payment</Text>
          <Text style={styles.headerSubtitle}>Secure & Encrypted Transaction</Text>
          
          {/* Order Summary in Header */}
          {orderDetails && (
            <View style={styles.orderSummary}>
              <Text style={styles.orderSummaryText}>
                Order Total: LKR {orderDetails.totalAmount?.toLocaleString()}
              </Text>
              <Text style={styles.orderItemsText}>
                {getItemCount()} items • {orderDetails.isUrgent ? '24hr Delivery' : 'Standard Delivery'}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Form */}
        <View style={styles.formContainer}>
          {/* Order Details Section */}
          {orderDetails && (
            <View style={styles.orderSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Text style={styles.sectionIconText}>📦</Text>
                </View>
                <Text style={styles.sectionTitle}>Order Summary</Text>
              </View>
              
              <View style={styles.orderItems}>
                {Object.entries(orderDetails.items || {}).map(([itemId, item]) => (
                  <View key={itemId} style={styles.orderItem}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <Text style={styles.orderItemDetails}>
                      {item.quantity} x LKR {item.price.toLocaleString()}
                    </Text>
                  </View>
                ))}
                
                {orderDetails.isUrgent && (
                  <View style={styles.orderItem}>
                    <Text style={styles.orderItemName}>Urgent Delivery Fee</Text>
                    <Text style={styles.orderItemDetails}>LKR 200</Text>
                  </View>
                )}
                
                <View style={styles.orderTotal}>
                  <Text style={styles.orderTotalLabel}>Total Amount</Text>
                  <Text style={styles.orderTotalAmount}>
                    LKR {orderDetails.totalAmount?.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Card Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>💳</Text>
              </View>
              <Text style={styles.sectionTitle}>Card Details</Text>
            </View>
            
            {/* Name on Card */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name on Card</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter name as on card"
                placeholderTextColor="#9CA3AF"
                value={cardDetails.name}
                onChangeText={(text) => setCardDetails({...cardDetails, name: text})}
                autoCapitalize="words"
              />
            </View>

            {/* Card Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012"
                placeholderTextColor="#9CA3AF"
                value={cardDetails.number}
                onChangeText={(text) => setCardDetails({...cardDetails, number: formatCardNumber(text)})}
                keyboardType="numeric"
                maxLength={14} // 12 digits + 2 spaces
              />
            </View>

            {/* Expiry and CVV Row */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  value={cardDetails.expiry}
                  onChangeText={(text) => setCardDetails({...cardDetails, expiry: formatExpiry(text)})}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123"
                  placeholderTextColor="#9CA3AF"
                  value={cardDetails.cvv}
                  onChangeText={(text) => setCardDetails({...cardDetails, cvv: text.replace(/\D/g, '').slice(0, 3)})}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Billing Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>🏠</Text>
              </View>
              <Text style={styles.sectionTitle}>Billing Address</Text>
            </View>
            
            {/* Billing Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Billing Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your complete address"
                placeholderTextColor="#9CA3AF"
                value={billingAddress.address}
                onChangeText={(text) => setBillingAddress({...billingAddress, address: text})}
                autoCapitalize="words"
              />
            </View>

            {/* City */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your city"
                placeholderTextColor="#9CA3AF"
                value={billingAddress.city}
                onChangeText={(text) => setBillingAddress({...billingAddress, city: text})}
                autoCapitalize="words"
              />
            </View>

            {/* State and Postal Code Row */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>State/Province</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="State/Province"
                  placeholderTextColor="#9CA3AF"
                  value={billingAddress.state}
                  onChangeText={(text) => setBillingAddress({...billingAddress, state: text})}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>Postal Code</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Postal code"
                  placeholderTextColor="#9CA3AF"
                  value={billingAddress.postalCode}
                  onChangeText={(text) => setBillingAddress({...billingAddress, postalCode: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Pay Now Button */}
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.payButtonText}>
                  Pay LKR {orderDetails?.totalAmount?.toLocaleString()}
                </Text>
                <Text style={styles.payButtonSubtext}>Secure & Encrypted Payment</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>🔒 Your payment information is secure and encrypted</Text>
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
    paddingBottom: 20,
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
    marginBottom: 16,
  },
  orderSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  orderSummaryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderItemsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
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
  orderSection: {
    backgroundColor: '#FDF2F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderItems: {
    marginTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderItemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  orderItemDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EC4899',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  payButton: {
    backgroundColor: '#EC4899',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  payButtonSubtext: {
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

export default PaymentScreen;