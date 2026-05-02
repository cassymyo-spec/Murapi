import { AiToolCall, AiToolExecutionResult } from './types';

const executeDraftReferralNote = (
  toolCall: AiToolCall
): AiToolExecutionResult => {
  const reason = String(toolCall.arguments.reason ?? '').trim();
  const urgency = String(toolCall.arguments.urgency ?? '').trim();
  const findings = Array.isArray(toolCall.arguments.keyFindings)
    ? toolCall.arguments.keyFindings.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const lines = [
    'Referral note draft',
    `Urgency: ${urgency || 'Not specified'}`,
    `Reason: ${reason || 'Not specified'}`,
  ];

  if (findings.length > 0) {
    lines.push('Key findings:');
    findings.forEach((finding) => {
      lines.push(`- ${finding}`);
    });
  }

  return {
    toolName: toolCall.name,
    outputText: lines.join('\n'),
  };
};

export const executeToolCall = async (
  toolCall: AiToolCall
): Promise<AiToolExecutionResult> => {
  switch (toolCall.name) {
    case 'draft_referral_note':
      return executeDraftReferralNote(toolCall);
    default:
      return {
        toolName: toolCall.name,
        outputText: `Unsupported tool call: ${toolCall.name}`,
      };
  }
};

export const executeToolCalls = async (
  toolCalls: AiToolCall[]
): Promise<AiToolExecutionResult[]> => {
  const results: AiToolExecutionResult[] = [];

  for (const toolCall of toolCalls) {
    results.push(await executeToolCall(toolCall));
  }

  return results;
};
