// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    apiIdentifier: 'gpt-4o-mini',
    description: 'For complex, multi-step tasks',
  },
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
    id: 'qwen2.5-coder',
    label: 'qwen2.5-coder',
    apiIdentifier: 'qwen2.5-coder',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'llama3.3';
