import React, { useEffect, useRef, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/NavigatorContainer';
import { executeToolCalls } from '../ai/executeTools';
import { AiRequest, AiResponse, AiToolCall } from '../ai/types';
import { ai } from '../native/ai';
import {
  saveClinicalSession,
} from '../storage/patientRepository';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ClinicalSession'>;
  route: RouteProp<RootStackParamList, 'ClinicalSession'>;
};

type Message = {
  id: string;
  role: 'murapi' | 'vhw';
  text: string;
  type?: 'normal' | 'danger' | 'action';
  timestamp: Date;
};

const QUICK_PROMPTS = [
  'Child has high fever and stiff neck',
  'Patient cannot drink anything',
  'There is blood in the stool',
  'Pregnant patient has not felt fetal movement today',
  'Patient is unconscious',
];

const INPUT_ACTIONS = [
  {
    key: 'text',
    title: 'Text',
    description: 'Type findings',
  },
  {
    key: 'voice',
    title: 'Voice',
    description: 'Dictate findings',
  },
  {
    key: 'image',
    title: 'Image',
    description: 'Attach a photo',
  },
] as const;

const getMockResponse = (
  complaint: string,
  userMessage: string,
  ageGroup: string
): { text: string; toolCalls?: AiToolCall[] } => {
  const lower = userMessage.toLowerCase();

  if (complaint === 'fever' && (ageGroup === 'under_2' || ageGroup === '2_5')) {
    if (lower.includes('stiff') || lower.includes('neck')) {
      return {
        text:
          `DANGER SIGN DETECTED\n\nStiff neck with fever in a young child may indicate meningitis.\n\nACTION: Refer immediately to the nearest clinic.\n\nWhile preparing referral:\n• Keep the child calm and comfortable\n• Do not give food or water\n• Note when symptoms started`,
        toolCalls: [
          {
            name: 'draft_referral_note',
            arguments: {
              reason: 'Fever with stiff neck in a young child',
              urgency: 'Immediate',
              keyFindings: ['High fever', 'Stiff neck', 'Urgent clinic referral needed'],
            },
          },
        ],
      };
    }
    if (lower.includes('convuls') || lower.includes('fit') || lower.includes('seizure')) {
      return {
        text:
          `URGENT DANGER SIGN\n\nFits or convulsions with fever are a serious danger sign.\n\nACTION: Refer immediately.\n\nFirst aid while waiting:\n• Lay the child on their side\n• Do not put anything in the mouth\n• Time the fit\n• Keep the airway clear`,
        toolCalls: [
          {
            name: 'draft_referral_note',
            arguments: {
              reason: 'Fits or convulsions with fever',
              urgency: 'Immediate',
              keyFindings: ['Convulsions', 'Fever', 'Emergency referral indicated'],
            },
          },
        ],
      };
    }
    return {
      text:
        `FEVER ASSESSMENT\n\nCheck for danger signs now:\n• Can the child drink or breastfeed?\n• Is the child vomiting everything?\n• Has the child had convulsions?\n• Is the child lethargic or unconscious?\n\nAlso check temperature, malaria risk, rash, and stiff neck. Tell me what you find.`,
    };
  }

  if (complaint === 'diarrhoea') {
    if (lower.includes('blood')) {
      return {
        text:
          `DANGER SIGN: BLOOD IN STOOL\n\nBloody diarrhoea needs urgent attention.\n\nACTION: Refer to the clinic today.\n\nWhile preparing:\n• Start ORS if the patient can drink\n• Do not give anti-diarrhoeal medicine\n• Monitor for dehydration`,
        toolCalls: [
          {
            name: 'draft_referral_note',
            arguments: {
              reason: 'Bloody diarrhoea',
              urgency: 'Same day',
              keyFindings: ['Blood in stool', 'Risk of dehydration'],
            },
          },
        ],
      };
    }
    return {
      text:
        `DIARRHOEA ASSESSMENT\n\nAssess dehydration first:\n• How many stools in the last 24 hours?\n• Can the patient drink?\n• Are the eyes sunken?\n• Does a skin pinch go back slowly?\n\nTell me the findings so I can help you classify the case.`,
    };
  }

  if (complaint === 'pregnancy') {
    if (lower.includes('bleeding') || lower.includes('blood')) {
      return {
        text:
          `URGENT: BLEEDING IN PREGNANCY\n\nThis is a danger sign.\n\nACTION: Refer immediately to a clinic or hospital.\n\nWhile waiting:\n• Keep the patient lying down\n• Keep the patient warm\n• Monitor pulse and consciousness`,
        toolCalls: [
          {
            name: 'draft_referral_note',
            arguments: {
              reason: 'Bleeding in pregnancy',
              urgency: 'Immediate',
              keyFindings: ['Pregnancy', 'Bleeding', 'Emergency referral needed'],
            },
          },
        ],
      };
    }
    return {
      text:
        `PREGNANCY ASSESSMENT\n\nCheck for danger signs:\n• Any vaginal bleeding?\n• Severe headache or blurred vision?\n• Sudden swelling?\n• Reduced fetal movement?\n• Severe abdominal pain?\n\nIf any are present, refer today.`,
    };
  }

  if (complaint === 'breathing') {
    return {
      text:
        `PRIORITY: BREATHING DIFFICULTY\n\nCheck immediately:\n• Can the patient speak full sentences?\n• Is there chest in-drawing?\n• Are the lips or fingertips blue?\n• Is there stridor?\n\nIf any are present, refer immediately.`,
    };
  }

  if (complaint === 'unconscious') {
    return {
      text:
        `EMERGENCY: UNCONSCIOUS PATIENT\n\nACTION: Refer immediately.\n\nWhile waiting:\n• Check the airway\n• Place the patient in the recovery position\n• Check breathing and pulse\n• Do not give anything by mouth`,
      toolCalls: [
        {
          name: 'draft_referral_note',
          arguments: {
            reason: 'Unconscious patient',
            urgency: 'Immediate',
            keyFindings: ['Unconscious', 'Emergency support required'],
          },
        },
      ],
    };
  }

  if (complaint === 'chest_pain') {
    return {
      text:
        `CHEST PAIN ASSESSMENT\n\nAsk:\n• Where exactly is the pain?\n• Does it spread to the arm, neck, or jaw?\n• Is there sweating or nausea?\n• Is there difficulty breathing?\n\nIf there is crushing chest pain with sweating and spreading pain, refer immediately.`,
    };
  }

  if (complaint === 'seizure') {
    return {
      text:
        `URGENT: FITS OR SEIZURE\n\nACTION: Refer immediately after the seizure stops.\n\nDuring the seizure:\n• Do not restrain the patient\n• Clear the area\n• Lay the patient on the side if possible\n• Time the seizure`,
      toolCalls: [
        {
          name: 'draft_referral_note',
          arguments: {
            reason: 'Fits or seizure',
            urgency: 'Immediate',
            keyFindings: ['Seizure activity', 'Needs urgent clinic assessment'],
          },
        },
      ],
    };
  }

  if (lower.includes('refer') || lower.includes('referral')) {
    return {
      text:
        `REFERRAL GUIDANCE\n\nWhen referring:\n• Write the patient's name, age, sex, and main complaint\n• Include vital signs if taken\n• Record treatment given and time of referral\n• Arrange transport if needed`,
      toolCalls: [
        {
          name: 'draft_referral_note',
          arguments: {
            reason: 'Referral requested in session',
            urgency: 'As indicated by assessment',
            keyFindings: ['Referral planning in progress'],
          },
        },
      ],
    };
  }

  return {
    text:
      `Tell me more so I can support your assessment:\n• How long has this been happening?\n• Any other symptoms?\n• Can the patient eat and drink?\n• Any danger signs already present?`,
  };
};

const getFallbackAiResponse = async (request: AiRequest): Promise<AiResponse> => {
  const fallback = getMockResponse(
    request.patientContext.complaint,
    request.input.text,
    request.patientContext.ageGroup
  );

  return {
    text: fallback.text,
    toolCalls: fallback.toolCalls,
    modelName: 'local-mock-adapter',
  };
};

export default function ClinicalSessionScreen({ navigation, route }: Props) {
  const { patientName, village, ageGroup, sex, complaint } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [savedPatientCode, setSavedPatientCode] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const opening = `Patient: ${patientName}\nSex: ${sex}\nAge group: ${ageGroup.replace('_', '–')}\nChief complaint: ${complaint.replace('_', ' ')}\n\nDescribe what you are observing. You can type findings, use voice capture, or attach an image in this session. I will support assessment and referral guidance.`;

    setMessages([
      {
        id: '1',
        role: 'murapi',
        text: opening,
        type: 'normal',
        timestamp: new Date(),
      },
    ]);
  }, [patientName, sex, ageGroup, complaint]);

  const persistSession = async (): Promise<boolean> => {
    if (sessionSaved || messages.length === 0) {
      return true;
    }

    try {
      const result = saveClinicalSession({
        patientName,
        village: village || undefined,
        ageGroup,
        sex,
        complaint,
        sessionNotes: messages
          .filter((message) => message.role === 'vhw')
          .map((message) => message.text)
          .join('\n\n'),
        actionTaken: 'Murapi support session completed',
        wasReferred: messages.some((message) =>
          message.text.toLowerCase().includes('refer')
        ),
        messages: messages.map((message) => ({
          role: message.role,
          message: message.text,
        })),
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      setSavedPatientCode(result.patientCode);
      setSessionSaved(true);
      setSaveError(null);
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      setSaveError(
        error instanceof Error
          ? `Could not save session: ${error.message}`
          : 'Could not save session.'
      );
      return false;
    }
  };

  const handleExit = async () => {
    const didSave = await persistSession();

    if (!didSave) {
      return;
    }

    navigation.navigate('MainTabs');
  };

  const appendInputActionMessage = (mode: 'voice' | 'image') => {
    const actionText =
      mode === 'voice'
        ? 'Voice capture will be added here. For now, type the spoken findings below and keep everything in this same session.'
        : 'Image attachment will be added here. For now, describe the visible signs below and keep everything in this same session.';

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${mode}`,
        role: 'murapi',
        text: actionText,
        type: 'action',
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    const text = inputText.trim();

    if (!text || isThinking) {
      return;
    }

    const vhwMessage: Message = {
      id: Date.now().toString(),
      role: 'vhw',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, vhwMessage]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const history = [...messages, vhwMessage].map((message) => ({
      role: message.role,
      text: message.text,
    }));

    const request: AiRequest = {
      sessionId: `session_${Date.now()}`,
      patientContext: {
        patientName,
        village,
        ageGroup,
        sex,
        complaint,
      },
      history,
      input: {
        type: 'text',
        text,
      },
    };

    let response: AiResponse;

    try {
      response = await ai.sendMessage(request);
    } catch (error) {
      response = await getFallbackAiResponse(request);
    }

    const responseText = response.text;
    const isDanger =
      responseText.includes('DANGER SIGN') ||
      responseText.includes('URGENT') ||
      responseText.includes('EMERGENCY') ||
      responseText.includes('PRIORITY') ||
      responseText.includes('ACTION: Refer immediately');

    const murapiMessage: Message = {
      id: `${Date.now()}_reply`,
      role: 'murapi',
      text: responseText,
      type: isDanger ? 'danger' : 'normal',
      timestamp: new Date(),
    };

    const nextMessages: Message[] = [murapiMessage];

    if (response.modelName) {
      setModelName(response.modelName);
    }

    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolResults = await executeToolCalls(response.toolCalls);

      toolResults.forEach((toolResult, index) => {
        nextMessages.push({
          id: `${Date.now()}_tool_${index}`,
          role: 'murapi',
          text: toolResult.outputText,
          type: 'action',
          timestamp: new Date(),
        });
      });
    }

    setMessages((prev) => [...prev, ...nextMessages]);
    setIsThinking(false);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isVhw = item.role === 'vhw';

    return (
      <View
        style={[
          styles.messageWrap,
          isVhw ? styles.messageWrapVhw : styles.messageWrapMurapi,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isVhw ? styles.messageBubbleVhw : styles.messageBubbleMurapi,
            item.type === 'danger' && styles.messageBubbleDanger,
            item.type === 'action' && styles.messageBubbleAction,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isVhw ? styles.messageTextVhw : styles.messageTextMurapi,
            ]}
          >
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
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
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{patientName}</Text>
          <Text style={styles.headerSub}>
            {sex} · {ageGroup.replace('_', '–')} · {complaint.replace('_', ' ')}
          </Text>
          {village ? <Text style={styles.headerMeta}>{village}</Text> : null}
          {modelName ? <Text style={styles.headerMeta}>Model: {modelName}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.saveButton, sessionSaved && styles.saveButtonSaved]}
          onPress={handleExit}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>
            {sessionSaved ? 'Saved' : 'Save and close'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {isThinking ? (
        <View style={styles.thinkingRow}>
          <ActivityIndicator size="small" color="#888888" />
          <Text style={styles.thinkingText}>Murapi is thinking...</Text>
        </View>
      ) : null}

      {messages.length === 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPrompts}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.quickPrompt}
              onPress={() => setInputText(prompt)}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.inputPanel}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionRow}
        >
          {INPUT_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionChip}
              onPress={() => {
                if (action.key === 'voice' || action.key === 'image') {
                  appendInputActionMessage(action.key);
                  return;
                }

                setInputText((prev) => prev);
              }}
            >
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type findings, symptoms, signs, or referral notes..."
            placeholderTextColor="#b0b0b0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={600}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isThinking) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isThinking}
            activeOpacity={0.85}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {savedPatientCode ? (
          <Text style={styles.savedText}>
            Saved locally under patient code {savedPatientCode}.
          </Text>
        ) : null}
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'System',
  },
  headerSub: {
    fontSize: 13,
    color: '#666666',
    fontFamily: 'System',
    textTransform: 'capitalize',
  },
  headerMeta: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  saveButtonSaved: {
    backgroundColor: '#5f5f5f',
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  messageWrap: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageWrapMurapi: {
    justifyContent: 'flex-start',
  },
  messageWrapVhw: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  messageBubbleMurapi: {
    backgroundColor: '#f6f6f6',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  messageBubbleVhw: {
    backgroundColor: '#000000',
  },
  messageBubbleDanger: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  messageBubbleAction: {
    backgroundColor: '#f7f7f7',
    borderColor: '#dcdcdc',
    borderStyle: 'dashed',
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
    fontSize: 10,
    color: '#9d9d9d',
    fontFamily: 'System',
    alignSelf: 'flex-end',
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  thinkingText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
  },
  quickPrompts: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  quickPrompt: {
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  quickPromptText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'System',
  },
  inputPanel: {
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    backgroundColor: '#ffffff',
  },
  actionRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  actionChip: {
    backgroundColor: '#f6f6f6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 110,
    gap: 2,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  actionDescription: {
    fontSize: 11,
    color: '#7a7a7a',
    fontFamily: 'System',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'System',
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 74,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'System',
  },
  savedText: {
    fontSize: 11,
    color: '#666666',
    fontFamily: 'System',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  errorText: {
    fontSize: 11,
    color: '#b42318',
    fontFamily: 'System',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
