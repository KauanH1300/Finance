import React from 'react';
import {
  Banknote,
  Briefcase,
  TrendingUp,
  Store,
  PlusCircle,
  Home,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  GraduationCap,
  Utensils,
  Film,
  ShoppingBag,
  Tv,
  Compass,
  ShieldAlert,
  Coins,
  CreditCard,
  Smartphone,
  Wallet,
  DollarSign,
  HelpCircle,
  Flame,
  Sparkles,
  HandHeart,
  Moon,
  Sun,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Banknote,
  Briefcase,
  TrendingUp,
  Store,
  PlusCircle,
  Home,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  GraduationCap,
  Utensils,
  Film,
  ShoppingBag,
  Tv,
  Compass,
  ShieldAlert,
  Coins,
  CreditCard,
  Smartphone,
  Wallet,
  DollarSign,
  Flame,
  Sparkles,
  HandHeart,
  Moon,
  Sun,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};
