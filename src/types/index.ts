export type ConversionType = {
  id: string;
  from: string;
  to: string;
  label: string;
  icon: string;
  category: 'image' | 'document' | 'pdf';
};

export type FileItem = {
  id: string;
  name: string;
  uri: string;
  size: number;
  type: string;
  convertedUri?: string;
  createdAt?: string;
};

export type TabParamList = {
  Home: undefined;
  Tools: undefined;
  Scanner: undefined;
  Settings: undefined;
};