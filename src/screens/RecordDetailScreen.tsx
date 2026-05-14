import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigatorContainer';
import {
  EncounterRow,
  SessionMessage,
  getEncounterById,
  getEncounterMessages,
} from '../storage/patientRepository';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RecordDetail'>;
  route: RouteProp<RootStackParamList, 'RecordDetail'>;
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatComplaint = (value: string): string =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function RecordDetailScreen({ navigation, route }: Props) {
  const { encounterId } = route.params;
  const [encounter, setEncounter] = useState<EncounterRow | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);

  useFocusEffect(
    useCallback(() => {
      setEncounter(getEncounterById(encounterId));
      setMessages(getEncounterMessages(encounterId));
    }, [encounterId])
  );

  if (!encounter) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record not found</Text>
          <Text style={styles.headerSub}>
            This encounter could not be loaded from local storage.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {encounter.patient_name || encounter.patient_code}
          </Text>
          <Text style={styles.headerSub}>{formatDate(encounter.created_at)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Encounter summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Patient code</Text>
            <Text style={styles.value}>{encounter.patient_code}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Complaint</Text>
            <Text style={styles.value}>{formatComplaint(encounter.complaint)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Referral</Text>
            <Text style={styles.value}>
              {encounter.was_referred === 1 ? 'Marked as referred' : 'No referral marked'}
            </Text>
          </View>
          {encounter.action_taken ? (
            <View style={styles.block}>
              <Text style={styles.label}>Action taken</Text>
              <Text style={styles.bodyText}>{encounter.action_taken}</Text>
            </View>
          ) : null}
          {encounter.session_notes ? (
            <View style={styles.block}>
              <Text style={styles.label}>Session notes</Text>
              <Text style={styles.bodyText}>{encounter.session_notes}</Text>
            </View>
          ) : null}
          {encounter.referral_reason ? (
            <View style={styles.block}>
              <Text style={styles.label}>Referral reason</Text>
              <Text style={styles.bodyText}>{encounter.referral_reason}</Text>
            </View>
          ) : null}
          {encounter.follow_up_date ? (
            <View style={styles.block}>
              <Text style={styles.label}>Follow-up date</Text>
              <Text style={styles.bodyText}>{encounter.follow_up_date}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session transcript</Text>
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>No messages were saved for this encounter.</Text>
          ) : (
            messages.map((message) => {
              const isVhw = message.role === 'vhw';

              return (
                <View
                  key={message.id ?? `${message.role}-${message.created_at}-${message.message}`}
                  style={[
                    styles.messageBubble,
                    isVhw ? styles.messageBubbleVhw : styles.messageBubbleMurapi,
                  ]}
                >
                  <Text style={styles.messageRole}>{isVhw ? 'VHW' : 'Murapi'}</Text>
                  <Text
                    style={[
                      styles.messageText,
                      isVhw ? styles.messageTextVhw : styles.messageTextMurapi,
                    ]}
                  >
                    {message.message}
                  </Text>
                  <Text style={styles.messageTime}>{formatDate(message.created_at)}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  headerSub: {
    fontSize: 13,
    color: '#888888',
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  row: {
    gap: 4,
  },
  block: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: 'System',
  },
  value: {
    fontSize: 15,
    color: '#000000',
    fontFamily: 'System',
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 22,
    fontFamily: 'System',
  },
  emptyText: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 20,
    fontFamily: 'System',
  },
  messageBubble: {
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
  },
  messageBubbleMurapi: {
    backgroundColor: '#f6f6f6',
    borderColor: '#e4e4e4',
  },
  messageBubbleVhw: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  messageRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'System',
  },
  messageTextMurapi: {
    color: '#000000',
  },
  messageTextVhw: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 11,
    color: '#888888',
    fontFamily: 'System',
  },
});
