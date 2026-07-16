export interface Plan {
  id: string;
  name: string;
  category: 'monthly' | 'yearly';
  price: string;
  duration: string;
  features: string[];
  popular: boolean;
  description: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  photo: string;
  description: string;
  bio: string;
  certifications: string[];
  schedule: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  description: string;
  price: string;
  nutritionFacts: {
    servingSize: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    calories?: string;
    [key: string]: string | undefined;
  };
  ingredients: string[];
  benefits: string[];
  usage: string;
}

export interface Article {
  id: string;
  category: 'Protein Guide' | 'Calories Guide' | 'Vitamins Guide' | 'Nutrition Articles';
  title: string;
  summary: string;
  content: string; // Markdown or long form string
  image: string;
  author: string;
  readTime: string;
  publishedDate: string;
}

export interface GalleryItem {
  id: string;
  category: 'Reception' | 'Cardio Area' | 'Weight Training' | 'Locker Room';
  image: string;
  title: string;
  description: string;
}
