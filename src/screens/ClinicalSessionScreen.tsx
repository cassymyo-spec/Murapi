import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/NavigatorContainer';
import {
  createPatient,
  createEncounter,
  saveSessionMessages,
  generatePatientCode,
} from '../storage/patientRepository';


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList,
    'ClinicalSession'
  >;
  route: RouteProp<RootStackParamList, 'ClinicalSession'>;
};

type Message = {
  id: string;
  role: 'murapi' | 'vhw';
  text: string;
  type?: 'normal' | 'danger' | 'action' | 'referral';
  timestamp: Date;
};

const getMockResponse = (
  complaint: string,
  userMessage: string,
  ageGroup: string,
  sex: string
): string => {
  const lower = userMessage.toLowerCase();

  // Fever in child under 5 — IMCI protocol
  if (
    complaint === 'fever' &&
    (ageGroup === 'under_2' || ageGroup === 'under_5')
  ) {
    if (lower.includes('stiff') || lower.includes('neck')) {
      return `⚠️ DANGER SIGN DETECTED\n\nStiff neck with fever in a young child may indicate meningitis.\n\nACTION: Refer immediately to the nearest clinic. Do not wait.\n\nWhile preparing referral:\n• Keep child calm and comfortable\n• Do not give food or water\n• Note time symptoms started\n\nThis cannot be managed at home.`;
    }
    if (lower.includes('convuls') || lower.includes('fit') || lower.includes('seizure')) {
      return `⚠️ URGENT — DANGER SIGN\n\nFits or convulsions with fever is a serious danger sign.\n\nACTION: Refer immediately.\n\nFirst aid while waiting:\n• Lay child on their side\n• Do not put anything in mouth\n• Time how long the fit lasts\n• Keep airway clear\n\nRecord: duration of fit, number of fits, consciousness after.`;
    }
    if (lower.includes('not drinking') || lower.includes('refuses')) {
      return `⚠️ DANGER SIGN — Unable to drink\n\nA child with fever who cannot drink or breastfeed is a danger sign under IMCI protocol.\n\nCHECK:\n• Is the child lethargic or unconscious?\n• Pinch skin — does it go back slowly? (dehydration)\n• Check for sunken eyes\n\nIf ANY of these present → Refer immediately.\n\nIf none present → Oral rehydration, monitor closely, review in 2 hours.`;
    }
    return `FEVER ASSESSMENT — Child\n\nBased on IMCI protocol, check for danger signs:\n\n1. Can the child drink or breastfeed?\n2. Is the child vomiting everything?\n3. Has the child had convulsions?\n4. Is the child lethargic or unconscious?\n\nAlso check:\n• Temperature (if thermometer available)\n• Signs of malaria — test if RDT available\n• Rash, stiff neck, bulging fontanelle\n\nTell me what you find and I will guide you further.`;
  }

  // Diarrhoea
  if (complaint === 'diarrhoea') {
    if (lower.includes('blood')) {
      return `⚠️ DANGER SIGN — Blood in stool\n\nBloody diarrhoea (dysentery) requires urgent attention.\n\nACTION: Refer to clinic today.\n\nWhile preparing:\n• Start ORS immediately if child can drink\n• Do NOT give anti-diarrhoeal medicine\n• Monitor for signs of dehydration\n\nRecord: number of stools, amount of blood, duration.`;
    }
    return `DIARRHOEA ASSESSMENT\n\nFirst assess dehydration — this is the main danger.\n\nASSESS:\n• How many stools in last 24 hours?\n• Is there blood in the stool?\n• Can the patient drink?\n• Skin pinch test — does skin go back slowly?\n• Are eyes sunken?\n\nCLASSIFY:\n• No dehydration → ORS at home, zinc if under 5\n• Some dehydration → ORS at clinic\n• Severe dehydration → Refer immediately\n\nWhat do you observe?`;
  }

  // Pregnancy
  if (complaint === 'pregnancy') {
    if (
      lower.includes('bleeding') ||
      lower.includes('blood')
    ) {
      return `⚠️ URGENT — Bleeding in pregnancy\n\nVaginal bleeding during pregnancy is always a danger sign.\n\nACTION: Refer immediately to clinic or hospital.\n\nDo NOT:\n• Perform internal examination\n• Give any medication\n• Delay referral\n\nWhile waiting for transport:\n• Keep patient lying down\n• Keep warm\n• Monitor pulse and consciousness\n• Note amount of bleeding\n\nThis requires emergency care.`;
    }
    if (
      lower.includes('movement') ||
      lower.includes('kicks') ||
      lower.includes('baby not moving')
    ) {
      return `⚠️ CONCERN — Reduced fetal movement\n\nReduced or absent fetal movement after 28 weeks needs same-day assessment.\n\nACTION: Refer to clinic today — do not wait until tomorrow.\n\nASK:\n• How many weeks pregnant?\n• When did she last feel movement?\n• Any pain or bleeding?\n• Any fever?\n\nReassure the mother while arranging transport.`;
    }
    return `PREGNANCY ASSESSMENT\n\nKey danger signs to check:\n\n1. Any vaginal bleeding?\n2. Severe headache or blurred vision?\n3. Swelling of face, hands, or feet (sudden)?\n4. Reduced or no fetal movement?\n5. Fever?\n6. Severe abdominal pain?\n\nIf ANY present → Refer today.\n\nHow many weeks pregnant, and what is she experiencing?`;
  }

  // Breathing difficulty
  if (complaint === 'breathing') {
    return `⚠️ PRIORITY — Breathing difficulty\n\nDifficulty breathing can deteriorate quickly.\n\nIMMEDIATELY CHECK:\n• Is the patient able to speak full sentences?\n• Are nostrils flaring?\n• Is there chest in-drawing (skin pulling in between ribs)?\n• Blue lips or fingertips?\n• Stridor (high pitched noise when breathing)?\n\nIf ANY present → Refer immediately.\n\nSit patient upright. Do not lay flat.\n\nTell me the patient's age and what you observe.`;
  }

  // Unconscious
  if (complaint === 'unconscious') {
    return `🚨 EMERGENCY — Unconscious patient\n\nThis is a medical emergency.\n\nACTION: Refer immediately. Call for help now.\n\nWhile waiting:\n• Check airway — is it clear?\n• Place in recovery position (on side)\n• Check for breathing\n• Check for pulse\n• Do not give anything by mouth\n• Note time unconsciousness started\n\nDo not leave the patient alone.`;
  }

  // Hypertension / chest pain
  if (complaint === 'chest_pain') {
    return `CHEST PAIN ASSESSMENT\n\nChest pain needs careful assessment.\n\nASK:\n• Where exactly is the pain?\n• Does it spread to arm, neck, or jaw?\n• Is there sweating or nausea?\n• Difficulty breathing?\n• How long has it lasted?\n\nCHECK if available:\n• Blood pressure\n• Pulse rate and rhythm\n\nIf crushing chest pain + sweating + pain spreading to arm → Refer immediately. This may be a heart attack.\n\nWhat are the patient's symptoms?`;
  }

  // Seizure
  if (complaint === 'seizure') {
    return `⚠️ URGENT — Fits/Seizure\n\nACTION: Refer immediately after seizure stops.\n\nDURING seizure:\n• Do not restrain the patient\n• Clear the area of hard objects\n• Lay on side if possible\n• Time the duration\n• Do not put anything in mouth\n\nAFTER seizure:\n• Recovery position\n• Check breathing\n• Note: first seizure? Known epilepsy? Fever present?\n\nA first seizure always needs clinic assessment today.`;
  }

  // Generic follow-up responses
  if (lower.includes('refer') || lower.includes('referral')) {
    return `REFERRAL GUIDANCE\n\nWhen referring a patient:\n\n1. Write a referral note with:\n   • Patient name, age, sex\n   • Chief complaint\n   • Vital signs if taken\n   • Treatment given\n   • Time of referral\n\n2. Ensure transport is arranged\n\n3. If patient is critical — accompany if possible\n\n4. Inform the clinic by phone if you have signal\n\nRecord this encounter in Murapi after the referral.`;
  }

  if (lower.includes('thank') || lower.includes('done') || lower.includes('finish')) {
    return `Session complete. Well done.\n\nRemember to record this encounter in the Records tab so your supervisor can review.\n\nKey points from this session:\n• Follow up on any referrals made\n• Record outcome when known\n• Flag any concerns to your supervisor\n\nMurapi is here whenever you need guidance. 🌿`;
  }

  // Default — ask for more information
  return `I hear you. To give you the best guidance, tell me more:\n\n• How long has this been going on?\n• Any other symptoms alongside this?\n• Has the patient been seen at a clinic before for this?\n\nThe more detail you give me, the better I can support your assessment.`;
};

export default function ClinicalSessionScreen({
  navigation,
  route,
}: Props) {
  const { ageGroup, sex, complaint } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  const saveSession = async () => {
  try {
    const patientCode = generatePatientCode(sex);
    createPatient({
      patient_code: patientCode,
      age_group: ageGroup,
      sex,
      created_at: new Date().toISOString(),
    });

        const encounterId = createEncounter({
        patient_code: patientCode,
        complaint,
        action_taken: 'Guided by Murapi',
        was_referred: messages.some(
            (m) =>
            m.text.includes('Refer') ||
            m.text.includes('REFER')
        ),
        created_at: new Date().toISOString(),
        });

        saveSessionMessages(
        encounterId,
        messages.map((m) => ({
            role: m.role,
            message: m.text,
        }))
        );

        setSessionSaved(true);
    } catch (error) {
        console.error('Error saving session:', error);
    }
};

  useEffect(() => {
    const opening = buildOpeningMessage(complaint, ageGroup, sex);
    setMessages([
      {
        id: '1',
        role: 'murapi',
        text: opening,
        type: 'normal',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const buildOpeningMessage = (
    complaint: string,
    ageGroup: string,
    sex: string
  ): string => {
    const sexLabel = sex === 'male' ? 'male' : 'female';
    const ageLabel = ageGroup.replace('_', '–');
    const complaintLabel = COMPLAINTS.find(
      (c) => c.value === complaint
    )?.label ?? complaint;

    return `Patient: ${sexLabel}, age group ${ageLabel}\nChief complaint: ${complaintLabel}\n\nI am ready to support your assessment.\n\nDescribe what you are observing — symptoms, how long it has been happening, and anything else you notice. I will guide you through the assessment using Zimbabwe MOHCC protocols.`;
  };

  const COMPLAINTS = [
    { label: 'Fever', value: 'fever' },
    { label: 'Cough', value: 'cough' },
    { label: 'Diarrhoea', value: 'diarrhoea' },
    { label: 'Pregnancy concern', value: 'pregnancy' },
    { label: 'Chest pain', value: 'chest_pain' },
    { label: 'Headache', value: 'headache' },
    { label: 'Bleeding', value: 'bleeding' },
    { label: 'Breathing difficulty', value: 'breathing' },
    { label: 'Fits/Seizure', value: 'seizure' },
    { label: 'Not eating', value: 'not_eating' },
    { label: 'Unconscious', value: 'unconscious' },
    { label: 'Other', value: 'other' },
  ];

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isThinking) return;

    // Add VHW message
    const vhwMsg: Message = {
      id: Date.now().toString(),
      role: 'vhw',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, vhwMsg]);
    setInputText('');
    setIsThinking(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate Gemma on-device inference delay
    // Real Gemma 4 will replace this
    await new Promise((resolve) =>
      setTimeout(resolve, 1200 + Math.random() * 800)
    );

    const responseText = getMockResponse(
      complaint,
      text,
      ageGroup,
      sex
    );

    // Detect response type for styling
    const isDanger =
      responseText.includes('⚠️') ||
      responseText.includes('🚨') ||
      responseText.includes('URGENT') ||
      responseText.includes('EMERGENCY');

    const murapiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'murapi',
      text: responseText,
      type: isDanger ? 'danger' : 'normal',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, murapiMsg]);
    setIsThinking(false);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Render each message bubble
  const renderMessage = ({ item }: { item: Message }) => {
    const isVHW = item.role === 'vhw';
    const isDanger = item.type === 'danger';

    return (
      <View style={[
        styles.msgWrap,
        isVHW ? styles.msgWrapVHW : styles.msgWrapMurapi,
      ]}>
        {!isVHW && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>M</Text>
          </View>
        )}
        <View style={[
          styles.msgBubble,
          isVHW ? styles.bubbleVHW : styles.bubbleMurapi,
          isDanger && styles.bubbleDanger,
        ]}>
          <Text style={[
            styles.msgText,
            isVHW ? styles.msgTextVHW : styles.msgTextMurapi,
            isDanger && styles.msgTextDanger,
          ]}>
            {item.text}
          </Text>
          <Text style={styles.msgTime}>
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← End session</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
            <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>
                🩺 Live session
                </Text>
            </View>
            <TouchableOpacity
                style={[
                styles.endBtn,
                sessionSaved && styles.endBtnSaved,
                ]}
                onPress={async () => {
                if (!sessionSaved) await saveSession();
                navigation.navigate('MainTabs');
                }}
            >
                <Text style={styles.endBtnText}>
                {sessionSaved ? '✓ Saved' : 'End & Save'}
                </Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Patient info bar */}
      <View style={styles.patientBar}>
        <Text style={styles.patientInfo}>
          {sex === 'male' ? '👤' : '👤'}{' '}
          {sex} · {ageGroup.replace('_', '–')} yrs ·{' '}
          {complaint.replace('_', ' ')}
        </Text>
        <View style={styles.offlineDot} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Thinking indicator */}
      {isThinking && (
        <View style={styles.thinkingWrap}>
          <View style={styles.thinkingBubble}>
            <ActivityIndicator
              size="small"
              color="#888888"
            />
            <Text style={styles.thinkingText}>
              Murapi is thinking...
            </Text>
          </View>
        </View>
      )}

      {/* Quick prompts */}
      {messages.length === 1 && (
        <View style={styles.quickPrompts}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsInner}
          >
            {[
              'Child has high fever and stiff neck',
              'Patient cannot drink anything',
              'There is blood in the stool',
              'Pregnant — not felt baby move today',
              'Patient is unconscious',
            ].map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.quickPrompt}
                onPress={() => {
                  setInputText(prompt);
                }}
              >
                <Text style={styles.quickPromptText}>
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Describe what you observe..."
          placeholderTextColor="#cccccc"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            !inputText.trim() && styles.sendBtnDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isThinking}
          activeOpacity={0.8}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  backBtn: {},
  backText: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
  },
  headerRight: {},
  sessionBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  sessionBadgeText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
    fontFamily: 'System',
  },
  patientBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  patientInfo: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
    textTransform: 'capitalize',
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  msgWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  msgWrapMurapi: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
  },
  msgWrapVHW: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  msgAvatarText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
    fontFamily: 'System',
  },
  msgBubble: {
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  bubbleMurapi: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderTopLeftRadius: 4,
  },
  bubbleVHW: {
    backgroundColor: '#000000',
    borderTopRightRadius: 4,
  },
  bubbleDanger: {
    backgroundColor: '#fff8f0',
    borderColor: '#ffcc80',
    borderWidth: 1.5,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'System',
  },
  msgTextMurapi: {
    color: '#000000',
  },
  msgTextVHW: {
    color: '#ffffff',
  },
  msgTextDanger: {
    color: '#000000',
  },
  msgTime: {
    fontSize: 10,
    color: '#cccccc',
    fontFamily: 'System',
    alignSelf: 'flex-end',
  },
  thinkingWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  thinkingText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
  },
  quickPrompts: {
    paddingBottom: 8,
  },
  quickPromptsInner: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPrompt: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  quickPromptText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'System',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'System',
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#cccccc',
  },
  sendBtnText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '800',
  },
  endBtn: {
  backgroundColor: '#000000',
  borderRadius: 20,
  paddingVertical: 6,
  paddingHorizontal: 14,
 },
  endBtnSaved: {
   backgroundColor: '#888888',
 },
  endBtnText: {
   fontSize: 11,
   color: '#ffffff',
   fontWeight: '600',
   fontFamily: 'System',
 },
});