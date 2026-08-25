import {
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Stethoscope,
  GraduationCap,
  Fuel,
  MoreHorizontal
} from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'Food',
    name: 'Food',
    icon: Utensils,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconBg: 'bg-emerald-500',
    barColor: '#10b981'
  },
  {
    id: 'Travel',
    name: 'Travel',
    icon: Car,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconBg: 'bg-blue-500',
    barColor: '#3b82f6'
  },
  {
    id: 'Shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-500',
    barColor: '#a855f7'
  },
  {
    id: 'Bills',
    name: 'Bills',
    icon: FileText,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-500',
    barColor: '#f59e0b'
  },
  {
    id: 'Medical',
    name: 'Medical',
    icon: Stethoscope,
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    iconBg: 'bg-rose-500',
    barColor: '#f43f5e'
  },
  {
    id: 'Education',
    name: 'Education',
    icon: GraduationCap,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconBg: 'bg-indigo-500',
    barColor: '#6366f1'
  },
  {
    id: 'Fuel',
    name: 'Fuel',
    icon: Fuel,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconBg: 'bg-orange-500',
    barColor: '#f97316'
  },
  {
    id: 'Other',
    name: 'Other',
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconBg: 'bg-gray-500',
    barColor: '#6b7280'
  }
];

export const getCategoryConfig = (categoryName) => {
  return CATEGORIES.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase()) || CATEGORIES[CATEGORIES.length - 1];
};
