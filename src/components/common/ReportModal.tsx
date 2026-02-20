import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { getFontFamily } from '../../utils/fonts';
import { createReport, ReportType } from '../../services/firebase/reporting';
import Button from './Button';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  reportedUserId?: string;
  reportedPostId?: string;
  reportedRequestId?: string;
  reportedProfileId?: string;
}

const REPORT_TYPES: { label: string; value: ReportType }[] = [
  { label: 'Spam', value: 'spam' },
  { label: 'Inappropriate Content', value: 'inappropriate' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Fake Account', value: 'fake' },
  { label: 'Other', value: 'other' },
];

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  userId,
  reportedUserId,
  reportedPostId,
  reportedRequestId,
  reportedProfileId,
}) => {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport(userId, {
        reportedUserId,
        reportedPostId,
        reportedRequestId,
        reportedProfileId,
        reportType: selectedType,
        description: description.trim() || undefined,
      });

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it and take appropriate action.',
        [{ text: 'OK', onPress: onClose }]
      );

      // Reset form
      setSelectedType(null);
      setDescription('');
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Content</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>What's wrong with this content?</Text>
            
            <View style={styles.typeContainer}>
              {REPORT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    selectedType === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Additional Details (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Provide more information about the issue..."
              placeholderTextColor={Colors.secondaryText}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                disabled={isSubmitting}
              />
              <Button
                title={isSubmitting ? 'Submitting...' : 'Submit Report'}
                onPress={handleSubmit}
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting || !selectedType}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.primaryBackground,
    borderTopLeftRadius: BorderRadius.large,
    borderTopRightRadius: BorderRadius.large,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.standard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alternate + '33',
  },
  title: {
    ...Typography.headline4,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...Typography.headline4,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
  },
  content: {
    padding: Spacing.standard,
  },
  label: {
    ...Typography.body2,
    color: Colors.primaryText,
    fontFamily: getFontFamily(500),
    marginBottom: Spacing.small,
  },
  typeContainer: {
    marginBottom: Spacing.large,
    gap: Spacing.small,
  },
  typeButton: {
    padding: Spacing.medium,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
    backgroundColor: Colors.alternate + '15',
  },
  typeButtonActive: {
    borderColor: Colors.tertiary,
    backgroundColor: Colors.tertiary + '20',
  },
  typeButtonText: {
    ...Typography.body1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(500),
  },
  typeButtonTextActive: {
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  textInput: {
    ...Typography.body1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
    backgroundColor: Colors.alternate + '15',
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.medium,
    padding: Spacing.medium,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: Spacing.large,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.small,
  },
});

export default ReportModal;
