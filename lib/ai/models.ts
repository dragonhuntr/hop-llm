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
    id: 'Deepseek Coder V2',
    label: 'Deepseek Coder V2',
    apiIdentifier: 'deepseek-coder-v2',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o-mini';
