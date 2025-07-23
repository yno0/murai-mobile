import * as Font from 'expo-font';

export const loadPoppinsFonts = async () => {
  try {
    await Font.loadAsync({
      'Poppins-Thin': require('../../assets/fonts/Poppins-Thin.ttf'),
      'Poppins-ThinItalic': require('../../assets/fonts/Poppins-ThinItalic.ttf'),
      'Poppins-ExtraLight': require('../../assets/fonts/Poppins-ExtraLight.ttf'),
      'Poppins-ExtraLightItalic': require('../../assets/fonts/Poppins-ExtraLightItalic.ttf'),
      'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf'),
      'Poppins-LightItalic': require('../../assets/fonts/Poppins-LightItalic.ttf'),
      'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Italic': require('../../assets/fonts/Poppins-Italic.ttf'),
      'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
      'Poppins-MediumItalic': require('../../assets/fonts/Poppins-MediumItalic.ttf'),
      'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
      'Poppins-SemiBoldItalic': require('../../assets/fonts/Poppins-SemiBoldItalic.ttf'),
      'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
      'Poppins-BoldItalic': require('../../assets/fonts/Poppins-BoldItalic.ttf'),
      'Poppins-ExtraBold': require('../../assets/fonts/Poppins-ExtraBold.ttf'),
      'Poppins-ExtraBoldItalic': require('../../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
      'Poppins-Black': require('../../assets/fonts/Poppins-Black.ttf'),
      'Poppins-BlackItalic': require('../../assets/fonts/Poppins-BlackItalic.ttf'),
    });
    console.log('✅ Poppins fonts loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading Poppins fonts:', error);
    return false;
  }
};

export const checkFontAvailability = () => {
  const fonts = [
    'Poppins-Thin',
    'Poppins-Light', 
    'Poppins-Regular',
    'Poppins-Medium',
    'Poppins-SemiBold',
    'Poppins-Bold',
    'Poppins-ExtraBold',
    'Poppins-Black'
  ];
  
  fonts.forEach(font => {
    if (Font.isLoaded(font)) {
      console.log(`✅ ${font} is loaded`);
    } else {
      console.log(`❌ ${font} is NOT loaded`);
    }
  });
}; 