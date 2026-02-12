import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';

export const useDesignSystemFonts = () => {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  return fontsLoaded;
};

// Font weight mapping
export const getFontFamily = (weight: string | number): string => {
  const weightNum = typeof weight === 'string' ? parseInt(weight) : weight;
  
  if (weightNum >= 700) return 'Outfit-Bold';
  if (weightNum >= 600) return 'Outfit-SemiBold';
  if (weightNum >= 500) return 'Outfit-Medium';
  return 'Outfit-Regular';
};

