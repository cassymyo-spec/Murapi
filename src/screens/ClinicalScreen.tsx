import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

// ── TYPES ─────────────────────────────────────────────
type Message = {
  id: string;
  role: 'vhw' | 'murapi';
  text: string;
  timestamp: Date;
  type?: 'normal' | 'danger' | 'referral' | 'safe';
};

type PatientInfo = {
  age: string;
  sex: 'male' | 'female' | '';
  complaint: string;
};

// ── MOCK GEMMA RESPONSES ──────────────────────────────
// These simulate what Gemma 4 will return
// Keyed by keywords in the VHW's message
const getMockResponse = (
  input: string,
  patient: PatientInfo
): { text: string; type: 'normal' | 'danger' | 'referral' | 'safe' } => {
  const lower = input.toLowerCase();

  // Child with fever and danger signs
  if (
    lower.includes('fever') &&
    (lower.includes('convuls') ||
      lower.includes('fitting') ||
      lower.includes('unconscious') ||
      lower.includes('not drinking'))
  ) {
    return {
      type: 'danger',
      text:
        `⚠️ DANGER SIGNS DETECTED\n\n` +
        `Based on what you have described, this child shows ` +
        `signs that require URGENT referral.\n\n` +
        `Danger signs present:\n` +
        `• Fever with convulsions or altered consciousness\n` +
        `• Unable to drink or breastfeed\n\n` +
        `ACTION: Refer to clinic IMMEDIATELY.\n\n` +
        `While preparing for referral:\n` +
        `1. Keep the child calm and cool\n` +
        `2. Do not give anything by mouth if unconscious\n` +
        `3. Record the time convulsions started\n` +
        `4. Stay with the patient at all times`,
    };
  }

  // Fever in child — no danger signs
  if (lower.includes('fever') && parseInt(patient.age) < 10) {
    return {
      type: 'normal',
      text:
        `Assessment for fever in a child aged ${patient.age}:\n\n` +
        `Please check for these danger signs:\n` +
        `• Is the child able to drink or breastfeed?\n` +
        `• Has the child had convulsions?\n` +
        `• Is the child unusually sleepy or unconscious?\n` +
        `• Is the child vomiting everything?\n\n` +
        `Also check:\n` +
        `• Duration of fever (how many days?)\n` +
        `• Any stiff neck or rash?\n` +
        `• Recent travel to malaria area?\n\n` +
        `Please tell me what you find.`,
    };
  }

  // Malaria
  if (lower.includes('malaria') || lower.includes('rdt')) {
    return {
      type: 'normal',
      text:
        `Malaria Assessment:\n\n` +
        `Per Zimbabwe MOHCC protocol:\n\n` +
        `1. Perform RDT if not already done\n` +
        `2. Check temperature — record exact reading\n` +
        `3. Assess for danger signs (see IMCI)\n\n` +
        `If RDT POSITIVE and no danger signs:\n` +
        `→ Treat with AL (Artemether-Lumefantrine)\n` +
        `→ Dose by weight — record on register\n` +
        `→ Advise to return if no improvement in 48hrs\n\n` +
        `If RDT POSITIVE with danger signs:\n` +
        `→ REFER IMMEDIATELY\n\n` +
        `What is the RDT result?`,
    };
  }

  // Hypertension
  if (
    lower.includes('blood pressure') ||
    lower.includes('bp') ||
    lower.includes('hypertension') ||
    lower.includes('headache')
  ) {
    return {
      type: 'normal',
      text:
        `Hypertension / High BP Assessment:\n\n` +
        `Please take blood pressure reading now.\n\n` +
        `Interpretation guide:\n` +
        `• Normal: below 140/90\n` +
        `• High: 140/90 — 179/109 → refer to clinic\n` +
        `• Crisis: 180/110 or above → URGENT referral\n\n` +
        `Also ask:\n` +
        `• Any chest pain or shortness of breath?\n` +
        `• Any vision changes or severe headache?\n` +
        `• Known hypertensive on medication?\n\n` +
        `What is the BP reading?`,
    };
  }

  // Pregnancy
  if (
    lower.includes('pregnant') ||
    lower.includes('fetal') ||
    lower.includes('antenatal') ||
    lower.includes('baby not moving')
  ) {
    return {
      type: 'referral',
      text:
        `🔴 REFER TO CLINIC\n\n` +
        `Reduced fetal movement or pregnancy concerns ` +
        `require assessment by a nurse or midwife.\n\n` +
        `This is beyond VHW scope of practice.\n\n` +
        `ACTION:\n` +
        `1. Refer to nearest health facility TODAY\n` +
        `2. Do not delay — accompany patient if possible\n` +
        `3. Record referral in your register\n\n` +
        `Tell the mother:\n` +
        `"You need to be seen by a nurse today. ` +
        `This is important for your baby's safety."`,
    };
  }

  // Diarrhoea
  if (lower.includes('diarrhoea') || lower.includes('diarrhea')) {
    return {
      type: 'normal',
      text:
        `Diarrhoea Assessment:\n\n` +
        `Check for dehydration signs:\n\n` +
        `SEVERE (refer immediately if present):\n` +
        `• Sunken eyes\n` +
        `• Skin pinch goes back very slowly\n` +
        `• Child not able to drink\n` +
        `• Lethargic or unconscious\n\n` +
        `SOME dehydration (treat and monitor):\n` +
        `• Restless or irritable\n` +
        `• Sunken eyes\n` +
        `• Drinks eagerly, thirsty\n\n` +
        `NO dehydration:\n` +
        `• Give ORS and zinc at home\n` +
        `• Advise to return if gets worse\n\n` +
        `How many days has diarrhoea lasted? ` +
        `Any blood in stool?`,
    };
  }

  // Safe / monitor
  if (
    lower.includes('cough') &&
    !lower.includes('fast breathing') &&
    !lower.includes('difficulty breathing')
  ) {
    return {
      type: 'safe',
      text:
        `Cough Assessment:\n\n` +
        `Check breathing rate first.\n\n` +
        `Count breaths for 1 full minute:\n` +
        `• Child under 2 months: fast if ≥ 60/min\n` +
        `• Child 2–12 months: fast if ≥ 50/min\n` +
        `• Child 1–5 years: fast if ≥ 40/min\n\n` +
        `If NO fast breathing and NO chest indrawing:\n` +
        `→ No pneumonia — treat cough at home\n` +
        `→ Advise fluids and return if worse\n\n` +
        `If fast breathing OR chest indrawing:\n` +
        `→ Refer to clinic today\n\n` +
        `What is the breathing rate?`,
    };
  }

  // Default response
  return {
    type: 'normal',
    text:
      `Thank you. Based on what you have told me:\n\n` +
      `Patient: ${patient.sex || 'Unknown sex'}, ` +
      `${patient.age} years old\n` +
      `Complaint: ${patient.complaint}\n\n` +
      `Please describe the symptoms in more detail:\n` +
      `• How long has this been happening?\n` +
      `• Any fever? Take temperature if possible.\n` +
      `• Is the patient able to eat and drink?\n` +
      `• Any other symptoms?\n\n` +
      `The more detail you give me, the better ` +
      `I can guide you.`,
  };
};

// ── COMPONENT ─────────────────────────────────────────
export default function ClinicalScreen() {
  // Session state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Patient info state
  const [patient, setPatient] = useState<PatientInfo>({
    age: '',
    sex: '',
    complaint: '',
  });

  const scrollRef = useRef<ScrollView>(null);

  // ── START SESSION ────────────────────────────────────
  const startSession = () => {
    if (!patient.age || !patient.sex || !patient.complaint) return;

    setSessionStarted(true);

    // Opening message from Murapi
    const opening: Message = {
      id: '0',
      role: 'murapi',
      type: 'normal',
      timestamp: new Date(),
      text:
        `Session started.\n\n` +
        `Patient: ${patient.sex === 'male' ? 'Male' : 'Female'}, ` +
        `${patient.age} years old\n` +
        `Chief complaint: ${patient.complaint}\n\n` +
        `Please describe what you are seeing. ` +
        `Tell me the symptoms in detail and I will ` +
        `guide you through the assessment.`,
    };

    setMessages([opening]);
  };

  // ── SEND MESSAGE ─────────────────────────────────────
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    // Add VHW message
    const vhwMsg: Message = {
      id: Date.now().toString(),
      role: 'vhw',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, vhwMsg]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate Gemma inference delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1200 + Math.random() * 800)
    );

    // Get mock response
    const response = getMockResponse(text, patient);

    const murapiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'murapi',
      text: response.text,
      type: response.type,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, murapiMsg]);
    setIsTyping(false);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ── QUICK PROMPTS ────────────────────────────────────
  const QUICK_PROMPTS = [
    'Child has fever and convulsions',
    'Patient has high blood pressure',
    'Child has diarrhoea for 2 days',
    'Pregnant woman — baby not moving',
    'Child with cough and fast breathing',
  ];

  // ── RENDER MESSAGE ───────────────────────────────────
  const renderMessage = (msg: Message) => {
    const isVHW = msg.role === 'vhw';

    // Background colour based on message type
    const getBubbleStyle = () => {
      if (isVHW) return styles.bubbleVHW;
      switch (msg.type) {
        case 'danger': return styles.bubbleDanger;
        case 'referral': return styles.bubbleReferral;
        case 'safe': return styles.bubbleSafe;
        default: return styles.bubbleMurapi;
      }
    };

    const getTextStyle = () => {
      if (isVHW) return styles.bubbleTextVHW;
      switch (msg.type) {
        case 'danger': return styles.bubbleTextDanger;
        case 'referral': return styles.bubbleTextReferral;
        default: return styles.bubbleTextMurapi;
      }
    };

    return (
      <View
        key={msg.id}
        style={[
          styles.messageRow,
          isVHW ? styles.messageRowVHW : styles.messageRowMurapi,
        ]}
      >
        {/* Avatar */}
        {!isVHW && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
        )}

        {/* Bubble */}
        <View style={[styles.bubble, getBubbleStyle()]}>
          <Text style={[styles.bubbleText, getTextStyle()]}>
            {msg.text}
          </Text>
          <Text style={styles.timestamp}>
            {msg.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

      </View>
    );
  };

  // ── PATIENT INFO FORM ────────────────────────────────
  if (!sessionStarted) {
    const isReady =
      patient.age.length > 0 &&
      patient.sex !== '' &&
      patient.complaint.length > 0;

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>New session</Text>
          <Text style={styles.headerSub}>
            Enter basic patient information
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Age */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Patient age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4"
              placeholderTextColor="#cccccc"
              value={patient.age}
              onChangeText={(t) =>
                setPatient((p) => ({ ...p, age: t }))
              }
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>

          {/* Sex */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Sex</Text>
            <View style={styles.sexRow}>
              <TouchableOpacity
                style={[
                  styles.sexCard,
                  patient.sex === 'male' && styles.sexCardSelected,
                ]}
                onPress={() =>
                  setPatient((p) => ({ ...p, sex: 'male' }))
                }
                activeOpacity={0.7}
              >
                <Text style={styles.sexEmoji}>👨</Text>
                <Text style={[
                  styles.sexLabel,
                  patient.sex === 'male' && styles.sexLabelSelected,
                ]}>
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sexCard,
                  patient.sex === 'female' && styles.sexCardSelected,
                ]}
                onPress={() =>
                  setPatient((p) => ({ ...p, sex: 'female' }))
                }
                activeOpacity={0.7}
              >
                <Text style={styles.sexEmoji}>👩</Text>
                <Text style={[
                  styles.sexLabel,
                  patient.sex === 'female' && styles.sexLabelSelected,
                ]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chief complaint */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Chief complaint</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g. Child has had fever for 2 days"
              placeholderTextColor="#cccccc"
              value={patient.complaint}
              onChangeText={(t) =>
                setPatient((p) => ({ ...p, complaint: t }))
              }
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />
          </View>

          {/* Note */}
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              🔒  No patient names are recorded.
              All data stays on this device.
            </Text>
          </View>

        </ScrollView>

        {/* Start button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              !isReady && styles.buttonDisabled,
            ]}
            onPress={startSession}
            disabled={!isReady}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              Start Session
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    );
  }

  // ── SESSION CHAT UI ──────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

      {/* Session header */}
      <View style={styles.sessionHeader}>
        <View>
          <Text style={styles.sessionTitle}>
            {patient.sex === 'male' ? '👨' : '👩'} {' '}
            {patient.sex === 'male' ? 'Male' : 'Female'},
            {' '}{patient.age} yrs
          </Text>
          <Text style={styles.sessionComplaint}>
            {patient.complaint}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.endBtn}
          onPress={() => {
            setSessionStarted(false);
            setMessages([]);
            setPatient({ age: '', sex: '', complaint: '' });
          }}
        >
          <Text style={styles.endBtnText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(renderMessage)}

        {/* Typing indicator */}
        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowMurapi]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleMurapi]}>
              <View style={styles.typingWrap}>
                <ActivityIndicator
                  size="small"
                  color="#888888"
                />
                <Text style={styles.typingText}>
                  Murapi is thinking...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts — only shown at start */}
      {messages.length === 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPrompts}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.quickPrompt}
              onPress={() => {
                setInputText(prompt);
              }}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder="Describe what you are seeing..."
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
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

// ── STYLES ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf6',
  },

  // ── PATIENT FORM ──
  header: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
  },
  form: {
    paddingHorizontal: 28,
    gap: 20,
    paddingBottom: 20,
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000000',
    fontFamily: 'System',
  },
  inputMultiline: {
    height: 90,
    textAlignVertical: 'top',
  },
  sexRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sexCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  sexCardSelected: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  sexEmoji: {
    fontSize: 28,
  },
  sexLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
  },
  sexLabelSelected: {
    color: '#ffffff',
  },
  noteCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
  },
  noteText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'System',
  },

  // ── SESSION CHAT ──
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#ffffff',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  sessionComplaint: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
    marginTop: 2,
    maxWidth: 260,
  },
  endBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  endBtnText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
    fontFamily: 'System',
  },
  messages: {
    padding: 16,
    gap: 12,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  messageRowVHW: {
    justifyContent: 'flex-end',
  },
  messageRowMurapi: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'System',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  bubbleVHW: {
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  bubbleMurapi: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderBottomLeftRadius: 4,
  },
  bubbleDanger: {
    backgroundColor: '#fff0f0',
    borderWidth: 1.5,
    borderColor: '#ffcccc',
    borderBottomLeftRadius: 4,
  },
  bubbleReferral: {
    backgroundColor: '#fff8e8',
    borderWidth: 1.5,
    borderColor: '#ffd580',
    borderBottomLeftRadius: 4,
  },
  bubbleSafe: {
    backgroundColor: '#f0fff4',
    borderWidth: 1.5,
    borderColor: '#b7ebc8',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'System',
  },
  bubbleTextVHW: {
    color: '#ffffff',
  },
  bubbleTextMurapi: {
    color: '#000000',
  },
  bubbleTextDanger: {
    color: '#cc0000',
  },
  bubbleTextReferral: {
    color: '#996600',
  },
  timestamp: {
    fontSize: 10,
    color: '#aaaaaa',
    fontFamily: 'System',
    alignSelf: 'flex-end',
  },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  typingText: {
    fontSize: 13,
    color: '#888888',
    fontFamily: 'System',
    fontStyle: 'italic',
  },
  quickPrompts: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickPrompt: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  quickPromptText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'System',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'System',
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
});