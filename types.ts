
export interface PatientMetrics {
  height: number; // cm
  weight: number; // kg
  breastWidth: number; // cm
  currentSize: string;
  desiredLook: DesiredLook;
  age: number;
}

export enum DesiredLook {
  NATURAL = 'Tự nhiên (Natural)',
  FULL = 'Đầy đặn (Full)',
  DRAMATIC = 'Quyến rũ / Lớn (Dramatic)',
}

export interface VolumeOption {
  volume: number; // cc
  cupSize: string;
  style: string; // e.g. "Vừa vặn tự nhiên" or "Đầy đặn quyến rũ"
}

export interface AnalysisResult {
  option1: VolumeOption;
  option2: VolumeOption;
  bodyAnalysis: string;
  reasoning: string;
  implantsTypeSuggestion: string;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  stage: 'idle' | 'analyzing' | 'complete';
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  experience: string;
  hospital: string;
  avatar: string;
  rating: number;
  // New detailed fields
  bio?: string;
  specialties?: string[];
  certifications?: string[];
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  features: string[];
  // New detailed fields
  introduction?: string;
  gallery?: string[];
  phone?: string;
  isPartner?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  type: 'Round' | 'Anatomical';
  // New detailed fields
  technology?: string[];
  fullDescription?: string;
}
