import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { appConfig } from '../constants/config';
import Card from '../components/common/Card';

const DOCS_LIST = [
  { title: 'API Keys & Setup', file: 'API_KEYS_AND_SETUP.md', description: 'How to get Firebase, Google, Hugging Face, Instagram keys' },
  { title: 'Project Setup', file: 'SETUP.md', description: 'Install, Firebase, deploy, run' },
  { title: 'Google Sign-In', file: 'GOOGLE_SIGNIN_SETUP.md', description: 'OAuth client ID for Sign in with Google' },
  { title: 'Hugging Face', file: 'HUGGING_FACE_SETUP.md', description: 'Face verification for matrimonial photos' },
  { title: 'Instagram', file: 'INSTAGRAM_SETUP.md', description: 'Optional feed integration' },
  { title: 'Docs index', file: 'README.md', description: 'Full list of documentation' },
];

const AboutDeveloperScreen = () => {
  const insets = useSafeAreaInsets();

  const openDocsUrl = () => {
    const url = appConfig.docsBaseUrl;
    if (url?.trim()) Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.medium : Spacing.standard },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>About Bhatia Buzz</Text>
        <Text style={styles.subtitle}>For developers</Text>

        <Card style={styles.section} padding={Spacing.medium}>
          <Text style={styles.sectionTitle}>What this app does</Text>
          <Text style={styles.body}>
            Bhatia Buzz is a community app for the Bhatia community with a feed, requests (celebration, condolence, match), and a matrimonial section with profile creation, face verification, and match suggestions.
          </Text>
        </Card>

        <Card style={styles.section} padding={Spacing.medium}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <Text style={styles.body}>
            • <Text style={styles.bold}>Auth:</Text> Email/password and optional Google Sign-In (Firebase).{'\n'}
            • <Text style={styles.bold}>Feed:</Text> Posts from Firestore; optional Instagram posts if configured.{'\n'}
            • <Text style={styles.bold}>Requests:</Text> Create and view celebration, condolence, and match requests (admin approval flow).{'\n'}
            • <Text style={styles.bold}>Matrimonial:</Text> Create profile (with face verification via Hugging Face), browse matches, swipe, and view details.{'\n'}
            • <Text style={styles.bold}>Matching:</Text> Scores based on age, education, location, and preferences.{'\n'}
            • <Text style={styles.bold}>Guest mode:</Text> Browse feed and some screens without signing in.
          </Text>
        </Card>

        <Card style={styles.section} padding={Spacing.medium}>
          <Text style={styles.sectionTitle}>Main features</Text>
          <Text style={styles.body}>
            Community feed, Panja Khada, Matrimonial (Match) tab, Profile & Settings, Requests, Edit profile, Data export (GDPR), Reporting, Privacy policy & Terms, Multi-language (i18n), RTL support (e.g. Arabic).
          </Text>
        </Card>

        <Card style={styles.section} padding={Spacing.medium}>
          <Text style={styles.sectionTitle}>Documentation</Text>
          <Text style={styles.body}>
            All project docs live in the <Text style={styles.bold}>docs/</Text> folder in the repo. Key files:
          </Text>
          <View style={styles.docList}>
            {DOCS_LIST.map((doc) => (
              <View key={doc.file} style={styles.docRow}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docFile}>{doc.file}</Text>
                <Text style={styles.docDesc}>{doc.description}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.body}>
            Copy <Text style={styles.code}>docs/</Text> into your project and open the files in your editor, or clone the repo and read them there.
          </Text>
          {appConfig.docsBaseUrl?.trim() ? (
            <TouchableOpacity style={styles.linkButton} onPress={openDocsUrl} activeOpacity={0.8}>
              <Text style={styles.linkButtonText}>View docs online</Text>
            </TouchableOpacity>
          ) : null}
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{appConfig.name} v{appConfig.version}</Text>
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
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body3,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.large,
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
  body: {
    ...Typography.body3,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
    lineHeight: 22,
  },
  bold: {
    fontFamily: getFontFamily(600),
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: Colors.alternate + '22',
    paddingHorizontal: 4,
  },
  docList: {
    marginTop: Spacing.small,
    marginBottom: Spacing.medium,
  },
  docRow: {
    marginBottom: Spacing.medium,
    paddingBottom: Spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alternate + '33',
  },
  docTitle: {
    ...Typography.label1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
  },
  docFile: {
    ...Typography.label2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginTop: 2,
  },
  docDesc: {
    ...Typography.body4,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginTop: 2,
  },
  linkButton: {
    marginTop: Spacing.medium,
    paddingVertical: Spacing.small,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    ...Typography.label1,
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  footer: {
    marginTop: Spacing.large,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.label2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
  },
});

export default AboutDeveloperScreen;
