import { NativeModules } from 'react-native';
import { AiRequest, AiResponse } from '../ai/types';

type MurapiAINativeModule = {
  isModelReady(): Promise<boolean>;
  initializeModel(): Promise<boolean>;
  getModelStatus(): Promise<{
    ready: boolean;
    modelPath?: string | null;
    modelVersion?: string | null;
    checksum?: string | null;
    isDownloaded?: boolean;
    modelFileExists?: boolean;
    defaultModelDirectory?: string;
  }>;
  configureModel(config: {
    modelPath?: string;
    modelVersion?: string;
    checksum?: string;
    isDownloaded?: boolean;
  }): Promise<{
    ready: boolean;
    modelPath?: string | null;
    modelVersion?: string | null;
    checksum?: string | null;
    isDownloaded?: boolean;
    modelFileExists?: boolean;
    defaultModelDirectory?: string;
  }>;
  sendMessage(request: AiRequest): Promise<AiResponse>;
};

const { MurapiAI } = NativeModules as {
  MurapiAI?: MurapiAINativeModule;
};

const assertNativeModule = (): MurapiAINativeModule => {
  if (!MurapiAI) {
    throw new Error(
      'MurapiAI native module is not installed yet. Run native setup before calling AI features.'
    );
  }

  return MurapiAI;
};

export const ai = {
  isModelReady: async (): Promise<boolean> => {
    return assertNativeModule().isModelReady();
  },
  initializeModel: async (): Promise<boolean> => {
    return assertNativeModule().initializeModel();
  },
  getModelStatus: async () => {
    return assertNativeModule().getModelStatus();
  },
  configureModel: async (config: {
    modelPath?: string;
    modelVersion?: string;
    checksum?: string;
    isDownloaded?: boolean;
  }) => {
    return assertNativeModule().configureModel(config);
  },
  sendMessage: async (request: AiRequest): Promise<AiResponse> => {
    return assertNativeModule().sendMessage(request);
  },
};
