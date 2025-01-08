// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'GPT-4o Mini',
    label: 'gpt-4o-mini',
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
    id: 'Deepseek Coder V2',
    label: 'Deepseek Coder V2',
    apiIdentifier: 'deepseek-coder-v2',
    description: 'For complex, multi-step tasks',
  },
  {
    id: 'Qwen2.5',
    label: 'qwen2.5-coder',
    apiIdentifier: 'qwen2.5-coder',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o-mini';
