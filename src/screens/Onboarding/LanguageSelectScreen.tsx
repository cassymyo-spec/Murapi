import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { saveProfile } from '../../storage/profileStorage';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../navigation/NavigatorContainer";

type LanguageNavProp = NativeStackNavigationProp<RootStackParamList, 'LanguageSelect'>;

type Props = {
  navigation: LanguageNavProp;
};

const LANGUAGES = [
    {
        code: 'en',
        name: 'English',
        localName: 'English',
        description: "Default langauge"
    },
    {
        code: 'sn',
        name: 'Shona',
        localName: 'ChiShona',
        description: 'Mutauro wechiShona',
    },
    {
        code: 'nd',
        name: 'Ndebele',
        localName: 'IsiNdebele',
        description: 'Ulimi lwesiNdebele',
    },
]

type Language = {
    code: string;
    name:string;
    localName:string;
    description:string;
}

export default function LanguageSelectScreen({ navigation}: Props ) {
  const [selectedCode, setSelectedCode] = useState<string>('en');

  const renderLanguage = ({ item }: { item: Language }) => {

    const isSelected = selectedCode === item.code;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected, 
        ]}
        onPress={() => setSelectedCode(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={styles.cardText}>
            <Text style={[
              styles.cardName,
              isSelected && styles.cardNameSelected,
            ]}>
              {item.localName}
            </Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        </View>
        <View style={[
          styles.radio,
          isSelected && styles.radioSelected,
        ]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />
      <View style={styles.header}>
        <Text style={styles.headerStep}>Step 1 of 3</Text>
        <Text style={styles.headerTitle}>Choose your language</Text>
        <Text style={styles.headerSub}>
          Murapi will speak to you in this language
        </Text>
      </View>
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
      </View>
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await saveProfile({ language: selectedCode });
            navigation.navigate('ProfileSetup');
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 6,
  },
  headerStep: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
    lineHeight: 20,
  },
  progressWrap: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#e8e8e8',
    borderRadius: 3,
  },
  progressFill: {
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 3,
  },
  list: {
    paddingHorizontal: 28,
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
  },
  cardSelected: {
    borderColor: '#000000',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardFlag: {
    fontSize: 28,
  },
  cardText: {
    gap: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
  },
  cardNameSelected: {
    color: '#000000',
  },
  cardDesc: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#000000',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'System',
  },
});