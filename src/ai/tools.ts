export const toolDefinitions = [
  {
    name: 'draft_referral_note',
    description:
      'Create a structured referral note for a patient who should be sent to a clinic or hospital.',
    inputSchema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
        urgency: { type: 'string' },
        keyFindings: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['reason', 'urgency', 'keyFindings'],
    },
  },
] as const;

export type SupportedToolName = (typeof toolDefinitions)[number]['name'];
