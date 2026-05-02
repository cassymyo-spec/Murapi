export type AiChatRole = 'murapi' | 'vhw';

export type AiChatMessage = {
  role: AiChatRole;
  text: string;
};

export type AiToolCall = {
  name: string;
  arguments: Record<string, unknown>;
};

export type AiInput =
  | {
      type: 'text';
      text: string;
    };

export type AiPatientContext = {
  patientName: string;
  sex: string;
  ageGroup: string;
  complaint: string;
  village?: string;
};

export type AiRequest = {
  sessionId: string;
  patientContext: AiPatientContext;
  history: AiChatMessage[];
  input: AiInput;
};

export type AiResponse = {
  text: string;
  toolCalls?: AiToolCall[];
  modelName?: string;
};

export type AiToolExecutionResult = {
  toolName: string;
  outputText: string;
};
