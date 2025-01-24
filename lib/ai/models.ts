// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'llama3.3',
    label: 'Llama 3.3',
    apiIdentifier: 'llama3.3',
    description: 'For complex, multi-step tasks',
  },
  {
    id: 'llama3.2-vision',
    label: 'Llama 3.2 Vision',
    apiIdentifier: 'llama3.2-vision',
    description: 'For complex, multi-step tasks',
  },
  {
    id: 'deepseek-r1',
    label: 'DeepSeek-R1',
    apiIdentifier: 'deepseek-r1',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_ID: string = 'llama3.2-vision';
export const DEFAULT_TITLE_MODEL_ID: string = 'llama3.2-vision';