import React from "react";
import {
  Home,
  Grid3X3,
  Search,
  Info,
  Mail,
  ChefHat,
  Clock,
  Users,
  Star,
  ArrowRight,
  Menu,
  X,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  StickyNote,
  BookOpen,
  Utensils,
  Timer,
  ChefHat as Chef,
  Tag,
  Globe,
  Zap,
  HelpCircle,
} from "lucide-react";
import { categories } from "@/data/categories";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  grid: Grid3X3,
  search: Search,
  info: Info,
  mail: Mail,
  chef: ChefHat,
  clock: Clock,
  users: Users,
  star: Star,
  arrowRight: ArrowRight,
  menu: Menu,
  x: X,
  close: X,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  message: MessageCircle,
  note: StickyNote,
  book: BookOpen,
  utensils: Utensils,
  timer: Timer,
  tag: Tag,
  globe: Globe,
  zap: Zap,
  help: HelpCircle,
  categories: Grid3X3,
  search2: Search,
  info2: Info,
  explore: Search,
  about: Info,
  contact: Mail,
  authors: Users,
};

const Icon: React.FC<IconProps> = ({ name, size = 20, className }) => {
  const LucideIcon = iconMap[name.toLowerCase()];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} />;
};

export default Icon;
