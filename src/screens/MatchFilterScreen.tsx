import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setMatchFilters } from '../store/slices/matrimonialSlice';
import type { MatchFilters } from '../store/slices/matrimonialSlice';
import { RootStackParamList } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../utils/theme';
import { getFontFamily } from '../utils/fonts';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { MapPin } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GENDER_OPTIONS: { value: MatchFilters['genderFilter']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
];

const MatchFilterScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const savedFilters = useAppSelector((state) => state.matrimonial.matchFilters);

  const [ageMin, setAgeMin] = useState(savedFilters.ageMin);
  const [ageMax, setAgeMax] = useState(savedFilters.ageMax);
  const [locationQuery, setLocationQuery] = useState(savedFilters.locationQuery);
  const [locationRadiusKm, setLocationRadiusKm] = useState(savedFilters.locationRadiusKm);
  const [genderFilter, setGenderFilter] = useState<MatchFilters['genderFilter']>(savedFilters.genderFilter);
  const [locating, setLocating] = useState(false);

  const handleLocateMe = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to use "Locate me".');
        setLocating(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const cityRegion = [address?.city, address?.region, address?.country].filter(Boolean).join(', ');
      setLocationQuery(cityRegion || 'Current location');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not get your location. Try again or enter a city manually.');
    } finally {
      setLocating(false);
    }
  };

  const handleApply = () => {
    dispatch(
      setMatchFilters({
        ageMin,
        ageMax,
        locationQuery: locationQuery.trim(),
        locationRadiusKm,
        genderFilter,
      })
    );
    navigation.goBack();
  };

  const handleReset = () => {
    setAgeMin(18);
    setAgeMax(60);
    setLocationQuery('');
    setLocationRadiusKm(50);
    setGenderFilter('all');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryBackground }]} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section} padding={Spacing.medium}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Partner's age range</Text>
          <View style={styles.sliderRow}>
            <Text style={[styles.valueLabel, { color: colors.tertiary }]}>{ageMin}</Text>
            <Text style={[styles.sliderDash, { color: colors.secondaryText }]}>–</Text>
            <Text style={[styles.valueLabel, { color: colors.tertiary }]}>{ageMax}</Text>
          </View>
          <Text style={[styles.hint, { color: colors.secondaryText }]}>Minimum age</Text>
          <Slider
            style={styles.slider}
            minimumValue={18}
            maximumValue={100}
            step={1}
            value={ageMin}
            onValueChange={(v) => setAgeMin(Math.min(Math.round(v), ageMax))}
            minimumTrackTintColor={colors.tertiary}
            maximumTrackTintColor={colors.secondaryText + '40'}
            thumbTintColor={colors.tertiary}
          />
          <Text style={[styles.hint, { color: colors.secondaryText }]}>Maximum age</Text>
          <Slider
            style={styles.slider}
            minimumValue={18}
            maximumValue={100}
            step={1}
            value={ageMax}
            onValueChange={(v) => setAgeMax(Math.max(Math.round(v), ageMin))}
            minimumTrackTintColor={colors.tertiary}
            maximumTrackTintColor={colors.secondaryText + '40'}
            thumbTintColor={colors.tertiary}
          />
        </Card>

        <Card style={styles.section} padding={Spacing.medium}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Location</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, { color: colors.primaryText, borderColor: colors.alternate + '44' }]}
              value={locationQuery}
              onChangeText={setLocationQuery}
              placeholder="City or region"
              placeholderTextColor={colors.secondaryText}
            />
            <TouchableOpacity
              style={[styles.locateBtn, { backgroundColor: colors.tertiary + '20' }]}
              onPress={handleLocateMe}
              disabled={locating}
            >
              {locating ? (
                <ActivityIndicator size="small" color={colors.tertiary} />
              ) : (
                <>
                  <MapPin color={colors.tertiary} size={22} />
                  <Text style={[styles.locateBtnText, { color: colors.tertiary }]}>Locate me</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionTitle, { marginTop: Spacing.small, color: colors.primaryText }]}>Search radius (km)</Text>
          <View style={styles.sliderRow}>
            <Text style={[styles.valueLabel, { color: colors.tertiary }]}>{locationRadiusKm} km</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={200}
            step={5}
            value={locationRadiusKm}
            onValueChange={(v) => setLocationRadiusKm(Math.round(v))}
            minimumTrackTintColor={colors.tertiary}
            maximumTrackTintColor={colors.secondaryText + '40'}
            thumbTintColor={colors.tertiary}
          />
        </Card>

        <Card style={styles.section} padding={Spacing.medium}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Show profiles</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.genderChip,
                  { borderColor: colors.alternate + '66' },
                  genderFilter === opt.value && [styles.genderChipActive, { backgroundColor: colors.tertiary + '25', borderColor: colors.tertiary }],
                ]}
                onPress={() => setGenderFilter(opt.value)}
              >
                <Text
                  style={[
                    styles.genderChipText,
                    { color: colors.secondaryText },
                    genderFilter === opt.value && [styles.genderChipTextActive, { color: colors.tertiary }],
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <View style={styles.actions}>
          <Button title="Apply filters" onPress={handleApply} variant="primary" />
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={[styles.resetBtnText, { color: colors.secondaryText }]}>Reset to default</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.standard,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.large,
  },
  sectionTitle: {
    ...Typography.label1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.small,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  valueLabel: {
    ...Typography.body3,
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  sliderDash: {
    marginHorizontal: 8,
    color: Colors.secondaryText,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: Spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.alternate + '44',
    borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.small,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.primaryText,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.medium,
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.tertiary + '20',
    borderRadius: BorderRadius.button,
    gap: 6,
  },
  locateBtnText: {
    ...Typography.label2,
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.alternate + '66',
  },
  genderChipActive: {
    backgroundColor: Colors.tertiary + '25',
    borderColor: Colors.tertiary,
  },
  genderChipText: {
    ...Typography.label2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(500),
  },
  genderChipTextActive: {
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  actions: {
    marginTop: Spacing.large,
    gap: 12,
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  resetBtnText: {
    ...Typography.label2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(500),
  },
});

export default MatchFilterScreen;
