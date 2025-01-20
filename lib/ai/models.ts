// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
  vision: boolean
}

export const models: Array<Model> = [
  {
    id: 'GPT-4o Mini',
    label: 'gpt-4o-mini',
    apiIdentifier: 'gpt-4o-mini',
    description: 'For complex, multi-step tasks',
    vision: true
  },
  {
    id: 'llama3.3',
    label: 'Llama 3.3',
    apiIdentifier: 'llama3.3',
    description: 'For complex, multi-step tasks',
    vision: false,
  },
  {
    id: 'Llama3.2-Vision',
    label: 'llama3.2-vision',
    apiIdentifier: 'llama3.2-vision',
    description: 'For Vision',
    vision: true,
  },
  {
    id: 'Qwen2.5',
    label: 'qwen2.5-coder',
    apiIdentifier: 'qwen2.5-coder',
    description: 'For complex, multi-step tasks',
    vision: false,
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o-mini';
