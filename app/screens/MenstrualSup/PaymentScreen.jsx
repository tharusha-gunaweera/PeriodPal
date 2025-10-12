import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../../FirebaseConfig';

const PaymentScreen = ({ route, navigation }) => {
  const { orderDetails, donationDetails } = route.params || {};

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
  const [userData, setUserData] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveDonationToFirestore = async (paymentSuccess = true) => {
    try {
      const donationData = {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || userData?.email || 'anonymous',
        userName: donationDetails?.isAnonymous ? 'Anonymous' : (donationDetails?.name || userData?.firstName + ' ' + userData?.lastName || 'Unknown'),
        userPhone: userData?.phoneNumber || 'Not provided',
        amount: donationDetails?.amount || 0,
        isAnonymous: donationDetails?.isAnonymous || false,
        message: donationDetails?.message || '',
        paymentStatus: paymentSuccess ? 'completed' : 'failed',
        paymentMethod: 'card',
        createdAt: serverTimestamp(),
        type: 'donation',
        billingCity: billingAddress.city,
        billingState: billingAddress.state,
        billingPostalCode: billingAddress.postalCode
      };

      const docRef = await addDoc(collection(db, 'Donations'), donationData);
      console.log('Donation saved with ID: ', docRef.id);
      return true;
    } catch (error) {
      console.error('Error saving donation to Firestore:', error);
      return false;
    }
  };

  const savePurchaseToFirestore = async (paymentSuccess = true) => {
    try {
      const purchaseData = {
        // User information
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || userData?.email || 'anonymous',
        userName: userData?.firstName + ' ' + userData?.lastName || 'Unknown',
        userPhone: userData?.phoneNumber || 'Not provided',
        
        // Order details
        items: orderDetails?.items || {},
        totalAmount: orderDetails?.totalAmount || 0,
        itemCount: orderDetails?.itemCount || 0,
        isUrgent: orderDetails?.isUrgent || false,
        deliveryNote: orderDetails?.deliveryNote || '',
        
        // Delivery information
        deliveryDetails: orderDetails?.deliveryDetails || {},
        
        // Payment information
        paymentStatus: paymentSuccess ? 'completed' : 'failed',
        paymentMethod: 'card',
        
        // System information
        createdAt: serverTimestamp(),
        type: 'purchase',
        
        // Billing address
        billingAddress: billingAddress
      };

      const docRef = await addDoc(collection(db, 'Purchases'), purchaseData);
      console.log('Purchase saved with ID: ', docRef.id);
      return true;
    } catch (error) {
      console.error('Error saving purchase to Firestore:', error);
      return false;
    }
  };

  const handlePayment = async () => {
    if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    if (!billingAddress.address || !billingAddress.city || !billingAddress.state || !billingAddress.postalCode) {
      Alert.alert('Error', 'Please fill in all billing address fields');
      return;
    }

    if (!/^\d{12}$/.test(cardDetails.number.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Card number must be exactly 12 digits');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      Alert.alert('Error', 'Expiry date must be in MM/YY format');
      return;
    }

    if (!/^\d{3}$/.test(cardDetails.cvv)) {
      Alert.alert('Error', 'CVV must be 3 digits');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let saveSuccess;
      if (donationDetails) {
        saveSuccess = await saveDonationToFirestore(true);
      } else {
        saveSuccess = await savePurchaseToFirestore(true);
      }
      
      if (!saveSuccess) {
        Alert.alert('Payment Successful', 'Thank you for your payment! There was an issue saving your receipt, but your payment was processed.');
      }
      
      const successMessage = donationDetails 
        ? `Thank you for your generous donation of LKR ${donationDetails.amount?.toLocaleString()}. Your support helps us provide sanitary items to those in need.`
        : `Thank you for your order of LKR ${orderDetails?.totalAmount?.toLocaleString()}. Your items will be delivered ${orderDetails?.isUrgent ? 'within 24 hours' : 'soon'}.`;

      Alert.alert(
        'Payment Successful!', 
        successMessage,
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (donationDetails) {
                navigation.navigate('MainApp');
              } else {
                navigation.navigate('ShopScreen');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      if (donationDetails) {
        await saveDonationToFirestore(false);
      } else {
        await savePurchaseToFirestore(false);
      }
      
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const getItemCount = () => {
    if (!orderDetails?.items) return 0;
    return Object.values(orderDetails.items).reduce((sum, item) => sum + item.quantity, 0);
  };

  const isDonation = !!donationDetails;
  const screenTitle = isDonation ? 'Donation Payment' : 'Online Card Payment';
  const amount = isDonation ? donationDetails.amount : orderDetails?.totalAmount;

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          <Text style={styles.headerSubtitle}>Secure & Encrypted Transaction</Text>
          
          {(orderDetails || donationDetails) && (
            <View style={styles.orderSummary}>
              <Text style={styles.orderSummaryText}>
                {isDonation ? 'Donation Amount' : 'Order Total'}: LKR {amount?.toLocaleString()}
              </Text>
              {orderDetails && (
                <Text style={styles.orderItemsText}>
                  {getItemCount()} items • {orderDetails.isUrgent ? '24hr Delivery' : 'Standard Delivery'}
                </Text>
              )}
              {donationDetails?.isAnonymous && (
                <Text style={styles.orderItemsText}>
                  Anonymous Donation
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.formContainer}>
          {(orderDetails || donationDetails) && (
            <View style={styles.orderSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Text style={styles.sectionIconText}>
                    {isDonation ? '❤️' : '📦'}
                  </Text>
                </View>
                <Text style={styles.sectionTitle}>
                  {isDonation ? 'Donation Summary' : 'Order Summary'}
                </Text>
              </View>
              
              <View style={styles.orderItems}>
                {isDonation ? (
                  <>
                    <View style={styles.orderItem}>
                      <Text style={styles.orderItemName}>Donation Amount</Text>
                      <Text style={styles.orderItemDetails}>
                        LKR {donationDetails.amount?.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.orderItem}>
                      <Text style={styles.orderItemName}>Donor</Text>
                      <Text style={styles.orderItemDetails}>
                        {donationDetails.isAnonymous ? 'Anonymous' : donationDetails.name}
                      </Text>
                    </View>
                    {donationDetails.message && (
                      <View style={styles.orderItem}>
                        <Text style={styles.orderItemName}>Message</Text>
                        <Text style={[styles.orderItemDetails, styles.messageText]}>
                          {donationDetails.message}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}
                
                <View style={styles.orderTotal}>
                  <Text style={styles.orderTotalLabel}>
                    {isDonation ? 'Total Donation' : 'Total Amount'}
                  </Text>
                  <Text style={styles.orderTotalAmount}>
                    LKR {amount?.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>💳</Text>
              </View>
              <Text style={styles.sectionTitle}>Card Details</Text>
            </View>
            
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012"
                placeholderTextColor="#9CA3AF"
                value={cardDetails.number}
                onChangeText={(text) => setCardDetails({...cardDetails, number: formatCardNumber(text)})}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>

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

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>🏠</Text>
              </View>
              <Text style={styles.sectionTitle}>Billing Address</Text>
            </View>
            
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
                  {isDonation ? 'Donate' : 'Pay'} LKR {amount?.toLocaleString()}
                </Text>
                <Text style={styles.payButtonSubtext}>Secure & Encrypted Payment</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>
              🔒 Your payment information is secure and encrypted. Card details are not stored.
            </Text>
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
  messageText: {
    fontStyle: 'italic',
    textAlign: 'right',
    maxWidth: 150,
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