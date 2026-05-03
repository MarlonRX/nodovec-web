import {
  Target,
  PiggyBank,
  Plane,
  Car,
  Home,
  Laptop,
  Gift,
  Heart,
  Star,
  Wallet,
} from 'lucide-react';
import type { SavingsGoalIcon } from '../types/savingsGoalInterfaces';

export const GOAL_ICONS: Record<SavingsGoalIcon, React.ComponentType<{ className?: string; size?: number }>> = {
  Target,
  PiggyBank,
  Plane,
  Car,
  Home,
  Laptop,
  Gift,
  Heart,
  Star,
  Wallet,
};

export const GOAL_ICON_LIST: SavingsGoalIcon[] = [
  'Target',
  'PiggyBank',
  'Plane',
  'Car',
  'Home',
  'Laptop',
  'Gift',
  'Heart',
  'Star',
  'Wallet',
];