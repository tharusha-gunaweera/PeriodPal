import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const ShopScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('pads');
  const [cartItems, setCartItems] = useState({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [confirmDetails, setConfirmDetails] = useState(false);

  // Delivery details state
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    phone: ''
  });

  // Refs for text inputs
  const addressRef = useRef();
  const cityRef = useRef();
  const provinceRef = useRef();
  const phoneRef = useRef();
  const noteRef = useRef();

  // Product categories and items with prices in LKR
  const productCategories = {
    pads: {
      title: 'Pads',
      items: [
        { 
          id: 'pad_regular', 
          name: 'Regular Pads (10pk)', 
          price: 450,
          image: ''
        },
        { 
          id: 'pad_overnight', 
          name: 'Overnight Pads (8pk)', 
          price: 520,
          image: ''
        },
        { 
          id: 'pad_winged', 
          name: 'Winged Pads (12pk)', 
          price: 480,
          image: ''
        },
        { 
          id: 'panty_liners', 
          name: 'Panty Liners (20pk)', 
          price: 380,
          image: ''
        }
      ]
    },
    tampons: {
      title: 'Tampons',
      items: [
        { 
          id: 'tampon_regular', 
          name: 'Regular Tampons (16pk)', 
          price: 550,
          image: ''
        },
        { 
          id: 'tampon_super', 
          name: 'Super Tampons (12pk)', 
          price: 520,
          image: ''
        },
        { 
          id: 'tampon_organic', 
          name: 'Organic Tampons (10pk)', 
          price: 680,
          image: ''
        }
      ]
    },
    comfort: {
      title: 'Comfort Items',
      items: [
        { 
          id: 'pain_relief', 
          name: 'Pain Relief Tablets', 
          price: 250,
          image: ''
        },
        { 
          id: 'heating_pad', 
          name: 'Heating Pad', 
          price: 1200,
          image: ''
        },
        { 
          id: 'wet_wipes', 
          name: 'Intimate Wipes (30pk)', 
          price: 320,
          image: ''
        },
        { 
          id: 'chocolate', 
          name: 'Comfort Snack Pack', 
          price: 280,
          image: ''
        }
      ]
    },
    eco: {
      title: 'Eco-Friendly',
      items: [
        { 
          id: 'menstrual_cup', 
          name: 'Menstrual Cup', 
          price: 2500,
          image: ''
        },
        { 
          id: 'period_panties', 
          name: 'Period Panties', 
          price: 1800,
          image: ''
        },
        { 
          id: 'reusable_pads', 
          name: 'Reusable Pads (3pk)', 
          price: 1200,
          image: ''
        }
      ]
    }
  };

  const updateCart = (itemId, change) => {
    setCartItems(prev => {
      const currentQty = prev[itemId]?.quantity || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      
      const item = Object.values(productCategories)
        .flatMap(cat => cat.items)
        .find(i => i.id === itemId);
      
      return { 
        ...prev, 
        [itemId]: {
          quantity: newQty,
          price: item.price,
          name: item.name
        }
      };
    });
  };

  const calculateTotalItems = () => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  };

  const calculateTotalPrice = () => {
    return Object.values(cartItems).reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleDeliveryDetailChange = useCallback((field, value) => {
    setDeliveryDetails(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateForm = () => {
    if (calculateTotalItems() === 0) {
      Alert.alert('Empty Cart', 'Please add at least one item to your cart');
      return false;
    }

    if (!deliveryDetails.name || !deliveryDetails.address || !deliveryDetails.city || !deliveryDetails.province || !deliveryDetails.phone) {
      Alert.alert('Missing Information', 'Please fill in all delivery details');
      return false;
    }

    if (!confirmDetails) {
      Alert.alert('Confirmation Required', 'Please confirm that the details entered are correct');
      return false;
    }

    return true;
  };

  const handleDelivery = () => {
    if (!validateForm()) return;
    
    const finalTotal = calculateTotalPrice() + (isUrgent ? 200 : 0);
    
    navigation.navigate('PaymentScreen', {
      orderDetails: {
        items: cartItems,
        totalAmount: finalTotal,
        deliveryDetails: deliveryDetails,
        isUrgent: isUrgent,
        deliveryNote: deliveryNote,
        itemCount: calculateTotalItems()
      }
    });
  };

  // Navigate to Request Items screen
  const navigateToRequestItems = () => {
    navigation.navigate('RequestItemScreen');
  };

  // Focus management functions
  const focusNextField = (nextRef) => {
    if (nextRef && nextRef.current) {
      nextRef.current.focus();
    }
  };

  const CategoryButton = ({ category, title }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.categoryButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const ProductCard = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productEmoji}>{item.image}</Text>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>LKR {item.price.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.quantityControls}>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed
          ]}
          onPress={() => updateCart(item.id, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </Pressable>
        <Text style={styles.quantityText}>{cartItems[item.id]?.quantity || 0}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed
          ]}
          onPress={() => updateCart(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );

  const CustomCheckbox = ({ value, onValueChange, label }) => (
    <Pressable
      style={({ pressed }) => [
        styles.checkboxContainer,
        pressed && styles.checkboxPressed
      ]}
      onPress={() => onValueChange(!value)}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Text style={styles.checkboxCheckmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Shop Sanitary Items</Text>
              <Text style={styles.headerSubtitle}>Quality products at affordable prices</Text>
              
              {calculateTotalItems() > 0 && (
                <View style={styles.cartSummary}>
                  <Text style={styles.cartSummaryText}>
                    🛒 {calculateTotalItems()} items • LKR {calculateTotalPrice().toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Community Support Button */}
            <TouchableOpacity
              style={styles.supportButton}
              onPress={navigateToRequestItems}
            >
              <View style={styles.supportButtonContent}>
                <Text style={styles.supportButtonEmoji}>❤️</Text>
                <View style={styles.supportButtonTextContainer}>
                  <Text style={styles.supportButtonTitle}>Need Financial Assistance?</Text>
                  <Text style={styles.supportButtonSubtitle}>
                    Request free sanitary items through our community support program
                  </Text>
                </View>
                <Text style={styles.supportButtonArrow}>→</Text>
              </View>
            </TouchableOpacity>

            {/* Urgent Delivery Toggle */}
            <View style={styles.urgentContainer}>
              <View style={styles.urgentTextContainer}>
                <Text style={styles.urgentLabel}>🚨 Urgent Delivery</Text>
                <Text style={styles.urgentDescription}>
                  Get items within 24 hours (+LKR 200)
                </Text>
              </View>
              <Switch
                value={isUrgent}
                onValueChange={setIsUrgent}
                trackColor={{ false: '#E5E7EB', true: '#FECACA' }}
                thumbColor={isUrgent ? '#EF4444' : '#FFFFFF'}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <View style={styles.categoriesRow}>
                <CategoryButton category="pads" title="Pads" />
                <CategoryButton category="tampons" title="Tampons" />
              </View>
              <View style={styles.categoriesRow}>
                <CategoryButton category="comfort" title="Comfort" />
                <CategoryButton category="eco" title="Eco-Friendly" />
              </View>
            </View>

            {/* Product Selection */}
            <View style={styles.productsContainer}>
              <Text style={styles.sectionTitle}>
                {productCategories[selectedCategory].title}
              </Text>
              {productCategories[selectedCategory].items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                />
              ))}
            </View>

            {/* Delivery Details */}
            <View style={styles.deliveryContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Text style={styles.sectionIconText}>📍</Text>
                </View>
                <Text style={styles.sectionTitle}>Delivery Details</Text>
              </View>
              
              <View style={styles.deliveryInputContainer}>
                <Text style={styles.deliveryLabel}>Full Name</Text>
                <TextInput
                  style={styles.deliveryTextInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={deliveryDetails.name}
                  onChangeText={(text) => handleDeliveryDetailChange('name', text)}
                  returnKeyType="next"
                  autoCorrect={false}
                  autoCapitalize="words"
                  pointerEvents="auto"
                />
              </View>
              
              <View style={styles.deliveryInputContainer}>
                <Text style={styles.deliveryLabel}>Address</Text>
                <TextInput
                  ref={addressRef}
                  style={[styles.deliveryTextInput, styles.multilineInput]}
                  placeholder="Enter your street address"
                  placeholderTextColor="#9CA3AF"
                  value={deliveryDetails.address}
                  onChangeText={(text) => handleDeliveryDetailChange('address', text)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="next"
                  autoCorrect={false}
                  autoCapitalize="words"
                  pointerEvents="auto"
                />
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <View style={styles.deliveryInputContainer}>
                    <Text style={styles.deliveryLabel}>City</Text>
                    <TextInput
                      ref={cityRef}
                      style={styles.deliveryTextInput}
                      placeholder="City"
                      placeholderTextColor="#9CA3AF"
                      value={deliveryDetails.city}
                      onChangeText={(text) => handleDeliveryDetailChange('city', text)}
                      returnKeyType="next"
                      autoCorrect={false}
                      autoCapitalize="words"
                      pointerEvents="auto"
                    />
                  </View>
                </View>
                <View style={styles.halfInput}>
                  <View style={styles.deliveryInputContainer}>
                    <Text style={styles.deliveryLabel}>Province</Text>
                    <TextInput
                      ref={provinceRef}
                      style={styles.deliveryTextInput}
                      placeholder="Province"
                      placeholderTextColor="#9CA3AF"
                      value={deliveryDetails.province}
                      onChangeText={(text) => handleDeliveryDetailChange('province', text)}
                      returnKeyType="next"
                      autoCorrect={false}
                      autoCapitalize="words"
                      pointerEvents="auto"
                    />
                  </View>
                </View>
              </View>
              
              <View style={styles.deliveryInputContainer}>
                <Text style={styles.deliveryLabel}>Phone Number</Text>
                <TextInput
                  ref={phoneRef}
                  style={styles.deliveryTextInput}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  value={deliveryDetails.phone}
                  onChangeText={(text) => handleDeliveryDetailChange('phone', text)}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  autoCorrect={false}
                  autoCapitalize="none"
                  pointerEvents="auto"
                />
              </View>
            </View>

            {/* Delivery Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
              <TextInput
                ref={noteRef}
                style={styles.noteInput}
                placeholder="Any special delivery instructions or preferences..."
                placeholderTextColor="#9CA3AF"
                value={deliveryNote}
                onChangeText={setDeliveryNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
                autoCorrect={false}
                autoCapitalize="none"
                pointerEvents="auto"
              />
            </View>

            {/* Order Summary */}
            {calculateTotalItems() > 0 && (
              <View style={styles.summaryContainer}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryContent}>
                  {Object.entries(cartItems).map(([itemId, item]) => (
                    <View key={itemId} style={styles.summaryItem}>
                      <View style={styles.summaryItemInfo}>
                        <Text style={styles.summaryItemName}>{item.name}</Text>
                        <Text style={styles.summaryItemPrice}>LKR {item.price.toLocaleString()} x {item.quantity}</Text>
                      </View>
                      <Text style={styles.summaryItemTotal}>
                        LKR {(item.quantity * item.price).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                  
                  {isUrgent && (
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryItemName}>Urgent Delivery Fee</Text>
                      <Text style={styles.summaryItemTotal}>LKR 200</Text>
                    </View>
                  )}
                  
                  <View style={styles.summaryTotal}>
                    <Text style={styles.summaryTotalText}>
                      Total: LKR {(calculateTotalPrice() + (isUrgent ? 200 : 0)).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Confirmation Checkbox */}
            <View style={styles.confirmationContainer}>
              <CustomCheckbox
                value={confirmDetails}
                onValueChange={setConfirmDetails}
                label="I confirm the details that are entered are correct"
              />
            </View>

            {/* Delivery Button */}
            <TouchableOpacity
              style={[
                styles.deliveryButton,
                (calculateTotalItems() === 0 || !confirmDetails) && styles.deliveryButtonDisabled
              ]}
              onPress={handleDelivery}
              disabled={calculateTotalItems() === 0 || !confirmDetails}
            >
              <Text style={styles.deliveryButtonText}>
                Proceed to Payment
              </Text>
              <Text style={styles.deliveryButtonSubtext}>
                Total: LKR {(calculateTotalPrice() + (isUrgent ? 200 : 0)).toLocaleString()}
              </Text>
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  cartSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  cartSummaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // New Support Button Styles
  supportButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  supportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportButtonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  supportButtonTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  supportButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  supportButtonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  supportButtonArrow: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: 'bold',
  },
  urgentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  urgentTextContainer: {
    flex: 1,
  },
  urgentLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  urgentDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoriesContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryButton: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  categoryButtonActive: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#EC4899',
    fontWeight: 'bold',
  },
  productsContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#EC4899',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    backgroundColor: '#DB2777',
    transform: [{ scale: 0.95 }],
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  deliveryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deliveryInputContainer: {
    marginBottom: 16,
  },
  deliveryLabel: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  deliveryTextInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  noteContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryContent: {
    marginTop: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  summaryItemPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  summaryTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  confirmationContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  deliveryButton: {
    backgroundColor: '#EC4899',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 30,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  deliveryButtonDisabled: {
    opacity: 0.5,
  },
  deliveryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deliveryButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ShopScreen;