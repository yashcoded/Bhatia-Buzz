import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useTheme } from '../utils/theme';
import { getFontFamily } from '../utils/fonts';
import { contactInfo } from '../constants/config';
import { formatDate } from '../utils/locale';
import { useRTL, getTextAlign } from '../utils/rtl';

const lastUpdatedDate = (() => {
  try {
    const d = new Date(contactInfo.legalDocumentsLastUpdated);
    return isNaN(d.getTime()) ? contactInfo.legalDocumentsLastUpdated : formatDate(d);
  } catch {
    return contactInfo.legalDocumentsLastUpdated;
  }
})();

const TermsOfServiceScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const textAlign = getTextAlign();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryBackground }]} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.medium : Spacing.standard }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { textAlign }]}>{t('terms.title')}</Text>
        <Text style={[styles.lastUpdated, { textAlign }]}>{t('terms.lastUpdated')}: {lastUpdatedDate}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section1.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section1.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section2.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section2.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section3.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section3.content')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section3.points.accurate')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section3.points.security')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section3.points.credentials')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section3.points.unauthorized')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section3.points.responsible')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section4.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section4.content')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section4.points.illegal')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section4.points.harass')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section4.points.impersonate')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section4.points.violate')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section4.points.interfere')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('terms.section4.points.collect')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section5.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section5.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section6.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section6.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section7.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section7.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section8.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section8.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section9.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section9.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section10.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section10.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section11.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section11.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section12.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section12.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('terms.section13.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('terms.section13.content')}</Text>
          <Text style={styles.contactText}>Email: {contactInfo.legalEmail}</Text>
          {contactInfo.termsOfServiceUrl ? (
            <Pressable onPress={() => Linking.openURL(contactInfo.termsOfServiceUrl)} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>View terms of service online</Text>
            </Pressable>
          ) : null}
          <Text style={[styles.contactText, { textAlign }]}>{t('terms.section13.inApp')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  content: {
    padding: Spacing.standard,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.headline2,
    color: Colors.primaryText,
    fontFamily: getFontFamily(700),
    marginBottom: Spacing.xs,
  },
  lastUpdated: {
    ...Typography.body4,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.large,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.large,
  },
  sectionTitle: {
    ...Typography.headline4,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.small,
  },
  sectionText: {
    ...Typography.body3,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  bulletPoint: {
    ...Typography.body3,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    lineHeight: 22,
    marginBottom: Spacing.xxs,
    marginStart: Spacing.medium,
  },
  contactText: {
    ...Typography.body3,
    color: Colors.tertiary,
    fontFamily: getFontFamily(500),
    marginTop: Spacing.xs,
  },
  linkButton: {
    marginTop: Spacing.small,
  },
  linkButtonText: {
    ...Typography.body3,
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
    textDecorationLine: 'underline',
  },
});

export default TermsOfServiceScreen;

