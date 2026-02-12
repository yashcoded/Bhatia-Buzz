import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { contactInfo } from '../constants/config';
import { formatDate } from '../utils/locale';
import { useRTL, getTextAlign } from '../utils/rtl';

const PrivacyPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const textAlign = getTextAlign();

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.medium : Spacing.standard }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { textAlign }]}>{t('privacy.title')}</Text>
        <Text style={[styles.lastUpdated, { textAlign }]}>{t('privacy.lastUpdated')}: {formatDate(new Date())}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section1.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section1.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section2.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section2.content')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section2.points.account')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section2.points.phone')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section2.points.posts')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section2.points.requests')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section2.points.matrimonial')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section2.points.usage')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section3.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section3.content')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section3.points.services')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section3.points.features')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section3.points.communication')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section3.points.security')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section3.points.legal')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section4.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section4.content')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section4.points.users')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section4.points.providers')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section4.points.legal')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section5.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section5.content')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section5.points.access')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section5.points.portability')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section5.points.correction')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section5.points.deletion')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section5.points.object')}</Text>
          <Text style={[styles.bulletPoint, { textAlign: isRTL ? 'right' : 'left' }]}>• {t('privacy.section5.points.withdraw')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section5.footer')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section6.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section6.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section7.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section7.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section8.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section8.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section9.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section9.content')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>
            <Text style={styles.boldText}>{t('privacy.section9.dataLocation')}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section10.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section10.content')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('privacy.section11.title')}</Text>
          <Text style={[styles.sectionText, { textAlign }]}>{t('privacy.section11.content')}</Text>
          <Text style={styles.contactText}>Email: {contactInfo.privacyEmail}</Text>
          {contactInfo.privacyPolicyUrl ? (
            <Pressable onPress={() => Linking.openURL(contactInfo.privacyPolicyUrl)} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>View privacy policy online</Text>
            </Pressable>
          ) : null}
          <Text style={[styles.contactText, { textAlign }]}>{t('privacy.section11.inApp')}</Text>
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
  boldText: {
    fontFamily: getFontFamily(600),
    color: Colors.primaryText,
  },
});

export default PrivacyPolicyScreen;

