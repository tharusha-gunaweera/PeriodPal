import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const STORAGE_KEYS = {
  SELECTED_LANGUAGE: 'selectedLanguage'
};

// Get screen width for responsive design
const { width: screenWidth } = Dimensions.get('window');

// Comprehensive Health Tips Data
const healthTipsData = [
  {
    id: 1,
    category: 'cramps',
    title: {
      en: "Menstrual Cramps Relief",
      si: "මාසික රුධිරයේ වේදනාවෙන් මිදීම",
      ta: "மாதவிடாய் வலியைக் குறைப்பது"
    },
    image: require('../../../assets/health-tips/cramps.jpg'),
    tips: [
      {
        en: "Apply heat to your abdomen with a hot water bottle or heating pad for 15-20 minutes",
        si: "විනාඩි 15-20ක් උණු වතුර බෝතලයක් හෝ රත් කළ පැඩ් එකක් භාවිතා කර ඔබේ බඩවැල් වලට තාපය යොදන්න",
        ta: "15-20 நிமிடங்கள் வயிற்றில் சூடான நீர் பாட்டில் அல்லது சூடான திண்டு வைத்து வெப்பம் கொடுக்கவும்"
      },
      {
        en: "Drink ginger or peppermint tea 2-3 times daily to reduce inflammation",
        si: "දැවිල්ල අඩු කිරීම සඳහා දිනකට 2-3 වතාවක් ඉඟුරු හෝ පෙපර්මින්ට් තේ පානය කරන්න",
        ta: "வீக்கத்தைக் குறைக்க தினமும் 2-3 முறை இஞ்சி அல்லது புதினா தேயிலை குடிக்கவும்"
      },
      {
        en: "Practice gentle exercises like walking, yoga, or stretching for 30 minutes",
        si: "විනාඩි 30ක් නැවීම, යෝගාසන හෝ දිගු කිරීම් වැනි මෘදු ව්‍යායාම කරන්න",
        ta: "30 நிமிடங்கள் நடைப்பயணம், யோகா அல்லது இழுவைப் பயிற்சிகள் செய்யுங்கள்"
      },
      {
        en: "Massage your lower abdomen with essential oils like lavender or chamomile",
        si: "ලැවෙන්ඩර් හෝ කැමොමයිල් වැනි අත්‍යවශ්‍ය තෙල් භාවිතා කර ඔබේ පහළ බඩවැල් මසා දෙන්න",
        ta: "லவெண்டர் அல்லது கேமோமைல் போன்ற எண்ணெய்களைப் பயன்படுத்தி கீழ் வயிற்றை மசாஜ் செய்யுங்கள்"
      }
    ]
  },
  {
    id: 2,
    category: 'bloating',
    title: {
      en: "Reduce Bloating & Water Retention",
      si: "බඩ පිරීම සහ ජල රඳාපැවතීම අඩු කිරීම",
      ta: "வயிறு வீக்கம் மற்றும் நீர் தங்குதலைக் குறைத்தல்"
    },
    image: require('../../../assets/health-tips/bloating.jpg'),
    tips: [
      {
        en: "Reduce salt intake and avoid processed foods high in sodium",
        si: "ලවණ ප්‍රමාණය අඩු කර සෝඩියම් අධික ලෙස අඩංගු සකස් කළ ආහාර වළක්වන්න",
        ta: "உப்பு உட்கொள்ளலைக் குறைத்து, சோடியம் அதிகமுள்ள பதப்படுத்தப்பட்ட உணவுகளைத் தவிர்க்கவும்"
      },
      {
        en: "Drink 8-10 glasses of water daily to flush out excess sodium",
        si: "අතිරික්ත සෝඩියම් ඉවත් කිරීම සඳහා දිනකට ජල ග්ලාස් 8-10ක් බොන්න",
        ta: "அதிகப்படியான சோடியத்தை வெளியேற்ற தினமும் 8-10 கிளாஸ் தண்ணீர் குடிக்கவும்"
      },
      {
        en: "Eat potassium-rich foods like bananas, avocados, and spinach",
        si: "කෙලෙලි, අලිගැට පේර සහ නිවිති වැනි පොටෑසියම් බහුල ආහාර අනුභව කරන්න",
        ta: "வாழைப்பழம், ஆவகாடோ மற்றும் கீரை போன்ற பொட்டாசியம் நிறைந்த உணவுகளை சாப்பிடுங்கள்"
      },
      {
        en: "Avoid carbonated drinks and chew food slowly to reduce gas",
        si: "ගෑස් අඩු කිරීම සඳහා කාබනිකරණය කළ පාන වළක්වන්න සහ ආහාර සෙමින් ගිලින්න",
        ta: "கார்பனேற்றப்பட்ட பானங்களைத் தவிர்த்து, வாயுவைக் குறைக்க மெதுவாக உணவை மெல்லுங்கள்"
      }
    ]
  },
  {
    id: 3,
    category: 'mood_swings',
    title: {
      en: "Manage Mood Swings & Emotional Health",
      si: "මනෝභාවයේ වෙනස්වීම් සහ චිත්තවේගී සෞඛ්‍යය කළමනාකරණය කිරීම",
      ta: "மன அலைபாய்ச்சல் மற்றும் உணர்ச்சி ஆரோக்கியத்தை நிர்வகித்தல்"
    },
    image: require('../../../assets/health-tips/mood.jpg'),
    tips: [
      {
        en: "Practice deep breathing exercises for 5-10 minutes when feeling overwhelmed",
        si: "අධික ලෙස පීඩාවට පත් වන විට විනාඩි 5-10ක් ගැඹුරු හුස්ම ගැනීමේ ව්‍යායාම කරන්න",
        ta: "மிகைப்படுத்தப்பட்ட чувства 있을 때 5-10 நிமிடங்கள் ஆழமான சுவாசப் பயிற்சிகள் செய்யுங்கள்"
      },
      {
        en: "Get 7-9 hours of quality sleep each night",
        si: "පොරොන්දු වූ නිදා ගැනීමේ පැය 7-9ක් ලබා ගන්න",
        ta: "தினமும் 7-9 மணி நேர quality தூக்கம் பெறுங்கள்"
      },
      {
        en: "Reduce caffeine and sugar intake which can worsen mood swings",
        si: "මනෝභාවයේ වෙනස්වීම් වැඩි කළ හැකි කෆීන් සහ සීනි ප්‍රමාණය අඩු කරන්න",
        ta: "மன அலைபாய்ச்சலை மோசமாக்கும் காஃபின் மற்றும் சர்க்கரை உட்கொள்ளலைக் குறைக்கவும்"
      },
      {
        en: "Talk to friends or family about your feelings",
        si: "ඔබේ චිත්තවේගීන් ගැන මිතුරන් හෝ පවුලේ අය සමඟ සාකච්ඡා කරන්න",
        ta: "உங்கள் உணர்வுகளை நண்பர்கள் அல்லது குடும்பத்தினருடன் பேசுங்கள்"
      }
    ]
  },
  {
    id: 4,
    category: 'fatigue',
    title: {
      en: "Combat Fatigue & Low Energy",
      si: "ක්ලාන්තතාවය සහ අඩු ශක්තිය පාලනය කිරීම",
      ta: "சோர்வு மற்றும் குறைந்த ஆற்றலை எதிர்த்துப் போராடுதல்"
    },
    image: require('../../../assets/health-tips/fatigue.jpg'),
    tips: [
      {
        en: "Eat iron-rich foods like spinach, lentils, and red meat",
        si: "නිවිති, පරිප්පු සහ රතු මස් වැනි යකඩ බහුල ආහාර අනුභව කරන්න",
        ta: "கீரை, பருப்பு வகைகள் மற்றும் சிவப்பு இறைச்சி போன்ற இரும்புச்சத்து நிறைந்த உணவுகளை சாப்பிடுங்கள்"
      },
      {
        en: "Take short 20-minute naps during the day if needed",
        si: "අවශ්‍ය නම් දිවා කාලයේ මිනිත්තු 20ක කෙටි නිද්රා ගන්න",
        ta: "தேவைப்பட்டால் பகலில் 20 நிமிடங்கள் குறுகிய தூக்கம் எடுக்கவும்"
      },
      {
        en: "Stay hydrated and eat small, frequent meals",
        si: "ජලය පානය කරන්න සහ කුඩා, නිතර ආහාර ගන්න",
        ta: "நீரேற்றம் செய்து, சிறிய, அடிக்கடி உணவுகளை சாப்பிடுங்கள்"
      }
    ]
  },
  {
    id: 5,
    category: 'headache',
    title: {
      en: "Relieve Menstrual Headaches",
      si: "මාසික රුධිරයේ හිසරදය නිවාරණය කිරීම",
      ta: "மாதவிடாய் தலைவலியை நிவர்த்தி செய்தல்"
    },
    image: require('../../../assets/health-tips/headache.jpg'),
    tips: [
      {
        en: "Apply cold compress to forehead and temples for 15 minutes",
        si: "විනාඩි 15ක් නළලට සහ කනුපිටට සීතල සම්පීඩනයක් යොදන්න",
        ta: "15 நிமிடங்கள் நெற்றி மற்றும் தற்காலிகங்களுக்கு குளிர் அமுக்கம் வைக்கவும்"
      },
      {
        en: "Stay in a dark, quiet room and practice relaxation techniques",
        si: "අඳුරු, නිසල කාමරයක රැඳී සිටින්න සහ විවේකීකරණ තාක්ෂණ පුරුදු කරන්න",
        ta: "இருண்ட, அமைதியான அறையில் தங்கி, ஓய்வு நுட்பங்களைப் பயிற்சி செய்யுங்கள்"
      },
      {
        en: "Maintain stable blood sugar by eating regular meals",
        si: "සාමාන්‍ය ආහාර ගෙන රුධිර සීනි මට්ටම ස්ථාවරව පවත්වා ගන්න",
        ta: "வழக்கமான உணவுகளை சாப்பிட்டு ரத்த சர்க்கரையை நிலையாக வைத்திருங்கள்"
      }
    ]
  }
];

const languages = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { id: 'ta', name: 'தமிழ்', flag: '🇱🇰' }
];

export default function HealthTipsScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('cramps');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    loadSelectedLanguage();
  }, []);

  const loadSelectedLanguage = async () => {
    try {
      const language = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_LANGUAGE);
      if (language) {
        setSelectedLanguage(language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const saveSelectedLanguage = async (language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, language);
      setSelectedLanguage(language);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const categories = [
    { id: 'cramps', emoji: '💢', label: { en: 'Cramps', si: 'වේදනාව', ta: 'வலி' } },
    { id: 'bloating', emoji: '🎈', label: { en: 'Bloating', si: 'බඩ පිරීම', ta: 'வயிறு வீக்கம்' } },
    { id: 'mood_swings', emoji: '😔', label: { en: 'Mood Swings', si: 'මනෝභාව වෙනස්වීම්', ta: 'மன அலைபாய்ச்சல்' } },
    { id: 'fatigue', emoji: '😴', label: { en: 'Fatigue', si: 'ක්ලාන්තතාවය', ta: 'சோர்வு' } },
    { id: 'headache', emoji: '🤕', label: { en: 'Headache', si: 'හිසරදය', ta: 'தலைவலி' } }
  ];

  const selectedTips = healthTipsData.find(tip => tip.category === selectedCategory);

  // Function to get dynamic font size based on language
  const getFontSize = (baseSize) => {
    if (selectedLanguage === 'ta') {
      return baseSize - 2; // Smaller font for Tamil
    }
    return baseSize;
  };

  // Function to get dynamic line height based on language
  const getLineHeight = (baseLineHeight) => {
    if (selectedLanguage === 'ta') {
      return baseLineHeight - 2; // Smaller line height for Tamil
    }
    return baseLineHeight;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: getFontSize(24) }]}>
          {selectedLanguage === 'en' ? 'Health Tips' : 
           selectedLanguage === 'si' ? 'සෞඛ්‍ය ඉඟි' : 'ஆரோக்கிய உதவிக்குறிப்புகள்'}
        </Text>
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Text style={styles.languageButtonText}>
            {languages.find(lang => lang.id === selectedLanguage)?.flag} 🌐
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Selection - FIXED: Grid layout instead of horizontal scroll */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonSelected
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelSelected,
                { fontSize: getFontSize(12) }
              ]}>
                {category.label[selectedLanguage]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Health Tips Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {selectedTips && (
          <View style={styles.tipsContainer}>
            {/* Title */}
            <Text style={[styles.tipsTitle, { fontSize: getFontSize(22) }]}>
              {selectedTips.title[selectedLanguage]}
            </Text>

            {/* Image */}
            <Image 
              source={selectedTips.image} 
              style={styles.tipsImage}
              resizeMode="cover"
            />

            {/* Tips List */}
            <View style={styles.tipsList}>
              {selectedTips.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={[styles.tipNumber, { fontSize: getFontSize(16) }]}>{index + 1}</Text>
                  <Text style={[
                    styles.tipText, 
                    { 
                      fontSize: getFontSize(14),
                      lineHeight: getLineHeight(20)
                    }
                  ]}>
                    {tip[selectedLanguage]}
                  </Text>
                </View>
              ))}
            </View>

            {/* Additional Advice */}
            <View style={styles.adviceContainer}>
              <Text style={[styles.adviceTitle, { fontSize: getFontSize(16) }]}>
                {selectedLanguage === 'en' ? 'Important Reminder:' :
                 selectedLanguage === 'si' ? 'වැදගත් අනුස්මරණය:' :
                 'முக்கியமான நினைவூட்டல்:'}
              </Text>
              <Text style={[
                styles.adviceText, 
                { 
                  fontSize: getFontSize(14),
                  lineHeight: getLineHeight(20)
                }
              ]}>
                {selectedLanguage === 'en' ? 'Consult your healthcare provider if symptoms persist or worsen.' :
                 selectedLanguage === 'si' ? 'රෝග ලක්ෂණ පවතින හෝ උග්‍ර වුවහොත් ඔබේ සෞඛ්‍ය සේවා සපයන්නා සමඟ පිළිසන්දර කරන්න.' :
                 'அறிகுறிகள் தொடர்ந்து இருந்தால் அல்லது மோசமடைந்தால், உங்கள் சுகாதார சேவை வழங்குநரைக் கலந்தாலோசிக்கவும்.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(20) }]}>
              {selectedLanguage === 'en' ? 'Select Language' :
               selectedLanguage === 'si' ? 'භාෂාව තෝරන්න' :
               'மொழியைத் தேர்ந்தெடுக்கவும்'}
            </Text>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.id && styles.languageOptionSelected
                ]}
                onPress={() => saveSelectedLanguage(language.id)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={[styles.languageName, { fontSize: getFontSize(16) }]}>
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.modalCloseButtonText, { fontSize: getFontSize(16) }]}>
                {selectedLanguage === 'en' ? 'Close' :
                 selectedLanguage === 'si' ? 'වසන්න' :
                 'மூடு'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  title: {
    fontWeight: '700',
    color: '#EC4899',
    textAlign: 'center',
    flex: 1,
  },
  languageButton: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  languageButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 12,
  },
  categoryButtonSelected: {
    backgroundColor: '#FDF2F8',
    borderColor: '#EC4899',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#EC4899',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipsTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsList: {
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  tipNumber: {
    fontWeight: '700',
    color: '#EC4899',
    marginRight: 12,
    backgroundColor: '#FDF2F8',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
  },
  tipText: {
    flex: 1,
    color: '#4B5563',
  },
  adviceContainer: {
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  adviceTitle: {
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  adviceText: {
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: '#FDF2F8',
    borderColor: '#EC4899',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    fontWeight: '500',
    color: '#1F2937',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});