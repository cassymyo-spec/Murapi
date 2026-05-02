import { AiPatientContext, AiRequest } from './types';
import { toolDefinitions } from './tools';

const buildPatientContextBlock = (patientContext: AiPatientContext): string => {
  const lines = [
    `Patient name: ${patientContext.patientName}`,
    `Sex: ${patientContext.sex}`,
    `Age group: ${patientContext.ageGroup}`,
    `Chief complaint: ${patientContext.complaint}`,
  ];

  if (patientContext.village && patientContext.village.trim().length > 0) {
    lines.push(`Village or area: ${patientContext.village}`);
  }

  return lines.join('\n');
};

export const buildSystemPrompt = (): string => {
  return [
    'You are Murapi, an offline clinical support assistant for Zimbabwe village health workers.',
    'You support assessment, danger-sign recognition, follow-up questions, referral guidance, and documentation.',
    'You do not diagnose, you do not replace a nurse or doctor, and you do not claim certainty where it does not exist.',
    'If danger signs are present, tell the user clearly to refer immediately.',
    'If information is incomplete, ask concise follow-up questions before making suggestions.',
    'Only call tools when they are necessary and when you have enough information.',
    'Return tool calls in structured JSON only when requested by the app format.',
  ].join('\n');
};

export const buildSafetyPrompt = (): string => {
  return [
    'Safety rules:',
    '1. Never present the output as a diagnosis.',
    '2. Escalate danger signs and emergencies clearly.',
    '3. Stay within village health worker support scope.',
    '4. Prefer referral guidance over treatment certainty when risk is high.',
  ].join('\n');
};

export const buildToolPrompt = (): string => {
  return [
    'Available tools:',
    ...toolDefinitions.map((tool) => {
      return `- ${tool.name}: ${tool.description}`;
    }),
    'When using a tool, return JSON with keys "assistant_text" and "tool_calls".',
  ].join('\n');
};

export const buildSessionPrompt = (request: AiRequest): string => {
  const historyBlock = request.history
    .map((message) => `${message.role.toUpperCase()}: ${message.text}`)
    .join('\n\n');

  return [
    buildSystemPrompt(),
    '',
    buildSafetyPrompt(),
    '',
    buildToolPrompt(),
    '',
    'Patient context:',
    buildPatientContextBlock(request.patientContext),
    '',
    'Conversation history:',
    historyBlock || 'No previous messages.',
    '',
    `Latest user input: ${request.input.text}`,
  ].join('\n');
};
