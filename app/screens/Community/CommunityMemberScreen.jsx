import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const CommunityMemberScreen = ({ navigation }) => {
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Hub</Text>
        <Text style={styles.headerSubtitle}>Together We Make a Difference</Text>
      </View>

      {/* Hero Section with Image and Description */}
      <View style={styles.heroSection}>
        {/* Community Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/community-hero.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Description Content */}
        <View style={styles.descriptionContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🤝</Text>
          </View>
          
          <Text style={styles.title}>Strength in Unity</Text>
          
          <Text style={styles.description}>
            Welcome to our compassionate community where women support women. 
            Whether you're seeking connection or looking to make an impact, 
            your presence here matters.
          </Text>

          {/* Key Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💫</Text>
              <Text style={styles.featureText}>Support System</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌱</Text>
              <Text style={styles.featureText}>Grow Together</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>❤️</Text>
              <Text style={styles.featureText}>Make Impact</Text>
            </View>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2K+</Text>
              <Text style={styles.statLabel}>Items Donated</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Support Rate</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsContainer}>
        {/* Join Community Button */}
        <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => navigation.navigate('CommunityList')}
            >
          <View style={styles.buttonContent}>
            <View style={[styles.buttonIconContainer, styles.joinIconContainer]}>
              <Text style={styles.buttonIcon}>👥</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Join Our Community</Text>
              <Text style={styles.buttonDescription}>
                Connect with other women, share experiences, and build meaningful relationships
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
          
          {/* Benefits List */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Private support groups</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Expert Q&A sessions</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Local meetups & events</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Help with Donation Button */}
        <TouchableOpacity
            style={[styles.actionButton, styles.donateButton]}
            onPress={() => navigation.navigate('DonationScreen')}
            >
          <View style={styles.buttonContent}>
            <View style={[styles.buttonIconContainer, styles.donateIconContainer]}>
              <Text style={styles.buttonIcon}>❤️</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Help with Donation</Text>
              <Text style={styles.buttonDescription}>
                Support women in need by contributing sanitary products and essential items
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
          
          {/* Impact List */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Text style={styles.benefitText}>Direct impact on lives</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🛡️</Text>
              <Text style={styles.benefitText}>100% goes to recipients</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📦</Text>
              <Text style={styles.benefitText}>Transparent distribution</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Testimonial Section */}
      <View style={styles.testimonialSection}>
        <Text style={styles.testimonialTitle}>What Our Community Says</Text>
        
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialQuote}>"</Text>
          <Text style={styles.testimonialText}>
            This community helped me through my toughest times. The support and resources 
            available made all the difference in my journey.
          </Text>
          <Text style={styles.testimonialAuthor}>- Tharusha, Community Member</Text>
        </View>
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Every action counts. Together, we're creating a world where no woman has to face 
          menstrual health challenges alone.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#EC4899',
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
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  heroSection: {
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#FDF2F8',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EC4899',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FDF2F8',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
  },
  joinButton: {
    borderColor: '#EC4899',
  },
  donateButton: {
    borderColor: '#8B5CF6',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  joinIconContainer: {
    backgroundColor: '#FDF2F8',
  },
  donateIconContainer: {
    backgroundColor: '#F3F4FF',
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  benefitsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  testimonialSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  testimonialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  testimonialQuote: {
    fontSize: 32,
    color: '#EC4899',
    marginBottom: 8,
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FDF2F8',
    marginHorizontal: 24,
    borderRadius: 16,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CommunityMemberScreen;