import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Callout, Marker, Polyline } from 'react-native-maps';

const { width: screenWidth } = Dimensions.get('window');

// Sample menstrual products data
const menstrualProducts = [
  { id: 1, name: 'Regular Pads', emoji: '🔴' },
  { id: 2, name: 'Super Pads', emoji: '🔵' },
  { id: 3, name: 'Tampons', emoji: '⚪' },
  { id: 4, name: 'Menstrual Cups', emoji: '🥤' },
  { id: 5, name: 'Pantyliners', emoji: '🩲' },
  { id: 6, name: 'Period Panties', emoji: '👙' },
  { id: 7, name: 'Pain Relief', emoji: '💊' },
  { id: 8, name: 'Heating Pad', emoji: '🔥' }
];

// Sri Lankan location photos
const locationPhotos = [
  { id: 1, uri: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&h=300&fit=crop', description: 'Colombo residential area' },
  { id: 2, uri: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&h=300&fit=crop', description: 'Kandy neighborhood' },
  { id: 3, uri: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop', description: 'Galle street view' },
  { id: 4, uri: 'https://images.unsplash.com/photo-1574362848142-d312d3bf8deb?w=400&h=300&fit=crop', description: 'Delivery spot' }
];

// Sri Lankan location descriptions
const locationDescriptions = [
  "Colombo apartment building with security guard. Look for the blue gate.",
  "Kandy house near Temple of the Tooth. Parking available on the main road.",
  "Galle Fort heritage building - deliver to the main entrance.",
  "Negombo beach house with coconut trees in front.",
  "Jaffna traditional house with red roof. Ring the bell twice.",
  "Anuradhapura ancient city area - house with garden.",
  "Trincomalee coastal residence - leave package at security desk.",
  "Kandy hillside bungalow with mountain view.",
  "Colombo 7 luxury apartment - use intercom system.",
  "Gampaha town house near bus stand."
];

// Sri Lankan names and locations
const generateCustomerData = (address) => {
  const names = [
    'Nimasha Perera', 'Sachini Fernando', 'Tharushi Silva', 'Dilini Rathnayake', 
    'Piumi Gunawardena', 'Chamodi Jayawardena', 'Hasini Bandara', 'Madhavi Wickramasinghe',
    'Shanika Rajapaksa', 'Anjali Karunaratne', 'Kavindi Alwis', 'Sithara Zoysa'
  ];
  
  const phones = [
    '+94-77-123-4567', '+94-71-234-5678', '+94-70-345-6789', '+94-76-456-7890',
    '+94-75-567-8901', '+94-78-678-9012', '+94-72-789-0123', '+94-74-890-1234'
  ];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomPhone = phones[Math.floor(Math.random() * phones.length)];
  const randomDescription = locationDescriptions[Math.floor(Math.random() * locationDescriptions.length)];
  
  // Generate random products (2-4 items)
  const productCount = Math.floor(Math.random() * 3) + 2;
  const selectedProducts = [];
  const availableProducts = [...menstrualProducts];
  
  for (let i = 0; i < productCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableProducts.length);
    selectedProducts.push(availableProducts[randomIndex]);
    availableProducts.splice(randomIndex, 1);
  }
  
  // Generate random urgency
  const urgencies = ['Low', 'Medium', 'High'];
  const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
  
  // Select 2-3 random photos
  const photoCount = Math.floor(Math.random() * 2) + 2;
  const selectedPhotos = [];
  const availablePhotos = [...locationPhotos];
  
  for (let i = 0; i < photoCount; i++) {
    const randomIndex = Math.floor(Math.random() * availablePhotos.length);
    selectedPhotos.push(availablePhotos[randomIndex]);
    availablePhotos.splice(randomIndex, 1);
  }

  return {
    name: randomName,
    phone: randomPhone,
    products: selectedProducts,
    urgency: urgency,
    specialInstructions: Math.random() > 0.7 ? 'Please ring doorbell twice' : 'Leave at front door',
    deliveryTime: `Within ${Math.floor(Math.random() * 4) + 1} hours`,
    locationDescription: randomDescription,
    photos: selectedPhotos
  };
};

// Pre-defined delivery locations in Sri Lanka
const predefinedDeliveries = [
  {
    id: '1',
    latitude: 6.9271,
    longitude: 79.8612,
    address: 'Colombo City Center, Colombo, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Colombo City Center')
  },
  {
    id: '2',
    latitude: 7.2906,
    longitude: 80.6337,
    address: 'Kandy City, Central Province, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Kandy City')
  },
  {
    id: '3',
    latitude: 6.0535,
    longitude: 80.2210,
    address: 'Galle Fort, Southern Province, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Galle Fort')
  },
  {
    id: '4',
    latitude: 7.1785,
    longitude: 79.8731,
    address: 'Negombo Beach, Western Province, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Negombo Beach')
  },
  {
    id: '5',
    latitude: 9.6615,
    longitude: 80.0255,
    address: 'Jaffna Town, Northern Province, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Jaffna Town')
  },
  {
    id: '6',
    latitude: 8.3114,
    longitude: 80.4037,
    address: 'Anuradhapura Ancient City, North Central Province, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Anuradhapura')
  },
  {
    id: '7',
    latitude: 8.5874,
    longitude: 81.2152,
    address: 'Trincomalee Harbor, Eastern Province, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Trincomalee')
  },
  {
    id: '8',
    latitude: 6.7056,
    longitude: 80.3847,
    address: 'Ratnapura City, Sabaragamuwa Province, Sri Lanka',
    completed: false,
    type: 'delivery',
    customer: generateCustomerData('Ratnapura')
  }
];

const MapScreen = () => {
  // Set initial region to Sri Lanka
  const [region, setRegion] = useState({
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 2.0,
    longitudeDelta: 2.0,
  });
  
  const [deliveries, setDeliveries] = useState(predefinedDeliveries);
  const [userLocation, setUserLocation] = useState(null);
  const [showDeliveryList, setShowDeliveryList] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Get user's current location in Sri Lanka
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Need location permission to get your current location');
        // Set default to Colombo if permission denied
        const defaultLocation = {
          latitude: 6.9271,
          longitude: 79.8612,
          id: 'user',
          title: 'Your Location',
          type: 'user'
        };
        setUserLocation(defaultLocation);
        setRegion({
          ...region,
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
        });
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        id: 'user',
        title: 'Your Location',
        type: 'user'
      };
      setUserLocation(userLoc);
      setRegion({
        ...region,
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
      });
    })();
  }, []);

  // Remove a delivery location
  const removeDelivery = (id) => {
    setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
    setOptimizedRoute([]); // Clear route when deliveries change
    setSelectedDelivery(null); // Close popup if open
  };

  // Mark delivery as completed
  const toggleDeliveryCompletion = (id) => {
    setDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === id 
          ? { ...delivery, completed: !delivery.completed }
          : delivery
      )
    );
  };

  // Calculate raw distance between two points (for optimization)
  const calculateRawDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate total distance for a route
  const calculateTotalDistance = (route) => {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += calculateRawDistance(
        route[i].latitude,
        route[i].longitude,
        route[i + 1].latitude,
        route[i + 1].longitude
      );
    }
    return totalDistance.toFixed(2);
  };

  // Optimize route to single delivery location
  const optimizeRouteToDelivery = (delivery) => {
    if (!userLocation) {
      Alert.alert('Error', 'Need your current location to optimize route');
      return;
    }

    // Create route from user location to the selected delivery
    const routeCoords = [
      userLocation,
      delivery
    ].map(loc => ({
      latitude: loc.latitude,
      longitude: loc.longitude
    }));

    setOptimizedRoute(routeCoords);
    
    const distance = calculateRawDistance(
      userLocation.latitude,
      userLocation.longitude,
      delivery.latitude,
      delivery.longitude
    ).toFixed(2);
    
    Alert.alert(
      'Route Optimized!', 
      `Direct route to ${delivery.customer.name}\nDistance: ${distance} km`
    );
  };

  // Clear all deliveries
  const clearAllDeliveries = () => {
    setDeliveries([]);
    setOptimizedRoute([]);
    setSelectedDelivery(null);
  };

  // Reset to predefined deliveries
  const resetDeliveries = () => {
    setDeliveries(predefinedDeliveries);
    setOptimizedRoute([]);
    setSelectedDelivery(null);
  };

  const getMarkerColor = (delivery) => {
    if (delivery.type === 'user') return 'blue';
    return delivery.completed ? 'green' : 'red';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return '#FF6B6B';
      case 'Medium': return '#FFA726';
      case 'Low': return '#4ECDC4';
      default: return '#4ECDC4';
    }
  };

  const handleCalloutPress = (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedPhotoIndex(0);
  };

  const closeCallout = () => {
    setSelectedDelivery(null);
    setSelectedPhotoIndex(0);
  };

  const nextPhoto = () => {
    if (selectedDelivery) {
      setSelectedPhotoIndex((prev) => 
        prev === selectedDelivery.customer.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (selectedDelivery) {
      setSelectedPhotoIndex((prev) => 
        prev === 0 ? selectedDelivery.customer.photos.length - 1 : prev - 1
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>🚚 Deliveries</Text>
        <Text style={styles.headerSubtitle}>Tap on any location pin to view details</Text>
      </View>

      {/* Map focused on Sri Lanka */}
      <MapView style={styles.map} region={region}>
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor={getMarkerColor(userLocation)}
          />
        )}
        
        {/* Delivery Location Markers - FIXED FOR ANDROID */}
        {deliveries.map((delivery, index) => (
          <Marker
            key={delivery.id}
            coordinate={delivery}
            title={`Delivery ${index + 1}`}
            description="Tap for details"
            pinColor={getMarkerColor(delivery)}
            onPress={() => handleCalloutPress(delivery)} // ✅ FIX: Changed from onCalloutPress to onPress
          >
            <Callout tooltip={true}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Delivery {index + 1}</Text>
                <Text style={styles.calloutAddress} numberOfLines={2}>
                  {delivery.address.split(',')[0]}
                </Text>
                <Text style={styles.calloutCustomer}>
                  👤 {delivery.customer.name}
                </Text>
                <Text style={styles.calloutTap}>Tap to view details →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        
        {/* Optimized Route Line */}
        {optimizedRoute.length > 0 && (
          <Polyline
            coordinates={optimizedRoute}
            strokeColor="#FF6B6B"
            strokeWidth={4}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Delivery Details Popup Modal */}
      <Modal
        visible={!!selectedDelivery}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCallout}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            {selectedDelivery && (
              <ScrollView style={styles.popupScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>Delivery Details</Text>
                  <TouchableOpacity onPress={closeCallout} style={styles.closePopupButton}>
                    <Text style={styles.closePopupText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Photo Gallery Section */}
                {selectedDelivery.customer.photos.length > 0 && (
                  <View style={styles.photoGallerySection}>
                    <Text style={styles.sectionTitle}>📸 Location Photos</Text>
                    <View style={styles.photoGallery}>
                      <View style={styles.mainPhotoContainer}>
                        <Image 
                          source={{ uri: selectedDelivery.customer.photos[selectedPhotoIndex].uri }}
                          style={styles.mainPhoto}
                          resizeMode="cover"
                        />
                        {selectedDelivery.customer.photos.length > 1 && (
                          <>
                            <TouchableOpacity style={[styles.photoNavButton, styles.prevButton]} onPress={prevPhoto}>
                              <Text style={styles.photoNavText}>‹</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.photoNavButton, styles.nextButton]} onPress={nextPhoto}>
                              <Text style={styles.photoNavText}>›</Text>
                            </TouchableOpacity>
                          </>
                        )}
                        <View style={styles.photoCounter}>
                          <Text style={styles.photoCounterText}>
                            {selectedPhotoIndex + 1} / {selectedDelivery.customer.photos.length}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.photoDescription}>
                        {selectedDelivery.customer.photos[selectedPhotoIndex].description}
                      </Text>
                      
                      {/* Thumbnail Strip */}
                      {selectedDelivery.customer.photos.length > 1 && (
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          style={styles.thumbnailStrip}
                        >
                          {selectedDelivery.customer.photos.map((photo, index) => (
                            <TouchableOpacity 
                              key={photo.id}
                              style={[
                                styles.thumbnailContainer,
                                index === selectedPhotoIndex && styles.selectedThumbnail
                              ]}
                              onPress={() => setSelectedPhotoIndex(index)}
                            >
                              <Image 
                                source={{ uri: photo.uri }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                              />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  </View>
                )}

                {/* Location Description Section */}
                <View style={styles.locationDescriptionSection}>
                  <Text style={styles.sectionTitle}>📍 Location in Sri Lanka</Text>
                  <View style={styles.descriptionCard}>
                    <Text style={styles.locationDescription}>
                      {selectedDelivery.customer.locationDescription}
                    </Text>
                    <View style={styles.addressCard}>
                      <Text style={styles.addressLabel}>Full Address:</Text>
                      <Text style={styles.addressText}>{selectedDelivery.address}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.customerSection}>
                  <Text style={styles.sectionTitle}>👤 Customer Information</Text>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{selectedDelivery.customer.name}</Text>
                    <Text style={styles.customerPhone}>📞 {selectedDelivery.customer.phone}</Text>
                    <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(selectedDelivery.customer.urgency) }]}>
                      <Text style={styles.urgencyText}>
                        ⚡ {selectedDelivery.customer.urgency} Priority
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.productsSection}>
                  <Text style={styles.sectionTitle}>🛍️ Requested Products</Text>
                  <View style={styles.productsList}>
                    {selectedDelivery.customer.products.map((product, index) => (
                      <View key={index} style={styles.productItem}>
                        <Text style={styles.productEmoji}>{product.emoji}</Text>
                        <Text style={styles.productName}>{product.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.deliveryInfoSection}>
                  <Text style={styles.sectionTitle}>🚚 Delivery Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Delivery Time:</Text>
                    <Text style={styles.infoValue}>{selectedDelivery.customer.deliveryTime}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Instructions:</Text>
                    <Text style={styles.infoValue}>{selectedDelivery.customer.specialInstructions}</Text>
                  </View>
                </View>

                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.confirmButton]}
                    onPress={() => {
                      optimizeRouteToDelivery(selectedDelivery);
                      closeCallout();
                    }}
                  >
                    <Text style={styles.actionBtnText}>✅ Confirm Delivery Route</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.callButton]}
                    onPress={() => Alert.alert('Call', `Calling ${selectedDelivery.customer.phone}`)}
                  >
                    <Text style={styles.actionBtnText}>📞 Call Customer</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, selectedDelivery.completed ? styles.undoButton : styles.completeButton]}
                    onPress={() => {
                      toggleDeliveryCompletion(selectedDelivery.id);
                      closeCallout();
                    }}
                  >
                    <Text style={styles.actionBtnText}>
                      {selectedDelivery.completed ? '↶ Mark Pending' : '✓ Mark Delivered'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Action Buttons - Bottom Right Corner */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deliveriesButton]} 
          onPress={() => setShowDeliveryList(true)}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <Text style={styles.actionButtonText}>Deliveries</Text>
          {deliveries.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{deliveries.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.resetButton]} 
          onPress={resetDeliveries}
        >
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <Text style={styles.actionButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.clearButton]} 
          onPress={clearAllDeliveries}
        >
          <Text style={styles.actionButtonIcon}>🗑️</Text>
          <Text style={styles.actionButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery List Modal */}
      <Modal
        visible={showDeliveryList}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Delivery List</Text>
              {optimizedRoute.length > 0 && (
                <Text style={styles.modalSubtitle}>Single Delivery Route Active</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => setShowDeliveryList(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {optimizedRoute.length > 0 && userLocation && (
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoText}>
                📍 Direct route to selected delivery location
              </Text>
            </View>
          )}

          <FlatList
            data={deliveries}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={[
                styles.deliveryItem,
                item.completed && styles.completedDeliveryItem
              ]}>
                <View style={styles.deliveryIndicator}>
                  <View style={[
                    styles.deliveryNumber,
                    item.completed && styles.completedDeliveryNumber
                  ]}>
                    <Text style={styles.deliveryNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                </View>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryAddress} numberOfLines={2}>
                    {item.address}
                  </Text>
                  <Text style={styles.customerNameSmall}>👤 {item.customer.name}</Text>
                  <View style={styles.productsPreview}>
                    {item.customer.products.slice(0, 3).map((product, idx) => (
                      <Text key={idx} style={styles.productPreview}>{product.emoji}</Text>
                    ))}
                    {item.customer.products.length > 3 && (
                      <Text style={styles.moreProducts}>+{item.customer.products.length - 3}</Text>
                    )}
                  </View>
                  {item.customer.photos.length > 0 && (
                    <View style={styles.photosPreview}>
                      <Text style={styles.photosPreviewText}>📸 {item.customer.photos.length} photos</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.deliveryActions}>
                  <TouchableOpacity 
                    style={[
                      styles.statusButton, 
                      item.completed ? styles.completedButton : styles.pendingButton
                    ]}
                    onPress={() => toggleDeliveryCompletion(item.id)}
                  >
                    <Text style={styles.statusButtonText}>
                      {item.completed ? '✓ Delivered' : 'Pending'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeDelivery(item.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🇱🇰</Text>
                <Text style={styles.emptyStateText}>
                  No deliveries available
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Press reset to reload delivery locations
                </Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  headerContainer: {
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  popupScrollView: {
    maxHeight: '80%',
  },
  popupContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  photosPreview: {
    marginTop: 4,
  },
  photosPreviewText: {
    fontSize: 11,
    color: '#666',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closePopupButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePopupText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deliveryInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: '30%',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    width: '68%',
    flexWrap: 'wrap',
  },
  popupActions: {
    padding: 20,
    gap: 12,
  },
  actionBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#6BCF7F',
  },
  callButton: {
    backgroundColor: '#8A4FFF',
  },
  completeButton: {
    backgroundColor: '#6BCF7F',
  },
  undoButton: {
    backgroundColor: '#FFE66D',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calloutContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  calloutCustomer: {
    fontSize: 12,
    color: '#8A4FFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutTap: {
    fontSize: 10,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1,
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    minWidth: 160,
  },
  deliveriesButton: {
    backgroundColor: '#8A4FFF',
  },
  resetButton: {
    backgroundColor: '#FFA726',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8A4FFF',
    fontWeight: '600',
    marginTop: 2,
  },
  routeInfo: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8A4FFF',
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    backgroundColor: 'white',
  },
  completedDeliveryItem: {
    backgroundColor: '#f8fff8',
    opacity: 0.8,
  },
  deliveryIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8A4FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedDeliveryNumber: {
    backgroundColor: '#6BCF7F',
  },
  deliveryNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deliveryLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  deliveryInfo: {
    flex: 1,
    marginRight: 10,
  },
  deliveryAddress: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  customerNameSmall: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  productsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPreview: {
    fontSize: 14,
    marginRight: 4,
  },
  moreProducts: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  deliveryDistance: {
    fontSize: 12,
    color: '#666',
  },
  deliveryActions: {
    alignItems: 'flex-end',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 6,
  },
  pendingButton: {
    backgroundColor: '#FFE66D',
  },
  completedButton: {
    backgroundColor: '#6BCF7F',
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  photoGallerySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoGallery: {
    marginBottom: 10,
  },
  mainPhotoContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  photoNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  photoNavText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photoDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  thumbnailStrip: {
    marginTop: 8,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#FF6B6B',
  },  
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  locationDescriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  descriptionCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8A4FFF',
  },
  locationDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
});

export default MapScreen;