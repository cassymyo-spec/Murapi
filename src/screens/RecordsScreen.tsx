import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getAllEncounters,
  EncounterRow,
} from '../storage/patientRepository';
import { RootStackParamList } from '../navigation/NavigatorContainer';

export default function RecordsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [encounters, setEncounters] = useState<EncounterRow[]>([]);
  const [search, setSearch] = useState('');

  // Reload every time tab is focused
  useFocusEffect(
    useCallback(() => {
      loadEncounters();
    }, [])
  );

  const loadEncounters = () => {
    const data = getAllEncounters();
    setEncounters(data);
  };

  const filtered = encounters.filter((e) =>
    search.length === 0 ||
    e.patient_code.toLowerCase().includes(search.toLowerCase()) ||
    (e.patient_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    e.complaint.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatComplaint = (c: string): string =>
    c.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const renderEncounter = ({ item }: { item: EncounterRow }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('RecordDetail', { encounterId: item.id })}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.codeWrap}>
          <Text style={styles.code}>{item.patient_code}</Text>
        </View>
        {item.was_referred === 1 && (
          <View style={styles.referredBadge}>
            <Text style={styles.referredText}>Referred</Text>
          </View>
        )}
        <Text style={styles.date}>
          {formatDate(item.created_at)}
        </Text>
      </View>

      {/* Complaint */}
      <Text style={styles.complaint}>
        {formatComplaint(item.complaint)}
      </Text>

      {/* Patient name if available */}
      {item.patient_name && (
        <Text style={styles.patientName}>
          {item.patient_name}
        </Text>
      )}

      {/* Action taken */}
      {item.action_taken && (
        <Text style={styles.action}>
          {item.action_taken}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Records</Text>
        <Text style={styles.headerSub}>
          {encounters.length} encounter
          {encounters.length !== 1 ? 's' : ''} recorded
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by code, name or complaint..."
          placeholderTextColor="#cccccc"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No records yet</Text>
          <Text style={styles.emptySub}>
            Complete a clinical session to see records here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEncounter}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 4,
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
  searchWrap: {
    paddingHorizontal: 28,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'System',
  },
  list: {
    paddingHorizontal: 28,
    gap: 10,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeWrap: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  code: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  referredBadge: {
    backgroundColor: '#fff8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  referredText: {
    fontSize: 11,
    color: '#e65100',
    fontWeight: '600',
    fontFamily: 'System',
  },
  date: {
    fontSize: 11,
    color: '#888888',
    fontFamily: 'System',
    marginLeft: 'auto',
  },
  complaint: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
  },
  patientName: {
    fontSize: 13,
    color: '#888888',
    fontFamily: 'System',
  },
  action: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  emptySub: {
    fontSize: 13,
    color: '#888888',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 20,
  },
});
