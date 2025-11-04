import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon; // Use LucideIcon type
  link: string;
  linkText: string;
  isPrimary?: boolean; // For the main feature (e.g., AI Mock Interviews)
  children?: React.ReactNode; // To allow custom content like your analysis card
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon, // Rename icon to Icon for component usage
  link,
  linkText,
  isPrimary = false,
  children,
}) => {
  return (
    <div
      className={`relative p-6 rounded-xl shadow-lg border 
      ${isPrimary ? "bg-gradient-to-br from-purple-800 to-indigo-900 border-purple-700" : "bg-dark-200 border-dark-300"}
      transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`p-3 rounded-full 
          ${isPrimary ? "bg-purple-600 text-white" : "bg-primary-300 text-dark-100"}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h3
          className={`text-xl font-semibold 
          ${isPrimary ? "text-white" : "text-primary-100"}`}
        >
          {title}
        </h3>
      </div>
      <p className={`text-light-200 mb-6 ${isPrimary ? 'text-opacity-90' : ''}`}>
        {description}
      </p>

      {children} {/* Renders custom content if provided */}

      <div className="mt-auto pt-4 border-t border-dark-300/50">
        <Link href={link} className={`inline-flex items-center text-sm font-medium 
          ${isPrimary ? "text-purple-300 hover:text-white" : "text-primary-100 hover:text-primary-200"}
          transition-colors duration-200`}
        >
          {linkText}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default FeatureCard;