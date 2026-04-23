// components/project/Stats.tsx

'use client';

import {
  PiCityLight,
  PiCubeLight,
  PiBuildingsLight,
  PiHouseLineLight,
  PiTreePalmLight,
} from "react-icons/pi";

// Map icons to their display labels and formatting
const statConfig: Record<string, { icon: any; label: string; format?: (value: string) => string }> = {
  location: {
    icon: PiCityLight,
    label: "LOCATION",
  },
  surfaceArea: {
    icon: PiCubeLight,
    label: "SURFACE AREA",
  },
  completed: {
    icon: PiBuildingsLight,
    label: "COMPLETED",
  },
  value: {
    icon: PiHouseLineLight,
    label: "VALUE",
    format: (value: string) => {
      // Remove any existing ₹ symbol and format
      const cleanValue = value.replace(/[₹\s]/g, '');
      return `₹ ${cleanValue}`;
    }
  },
  architect: {
    icon: PiTreePalmLight,
    label: "ARCHITECT",
  },
};

export interface StatItem {
  icon: string;  // Field key: "location", "surfaceArea", "completed", "value", "architect"
  title: string; // The actual value (e.g., "250 Cr")
  desc: string;  // Optional description
}

interface StatsProps {
  stats: StatItem[];
}

export function Stats({ stats }: StatsProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="border-t py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {stats.map((stat, i) => {
            const config = statConfig[stat.icon];
            if (!config) return null;
            
            const Icon = config.icon;
            // Format the value if a formatter exists
            const displayValue = config.format ? config.format(stat.title) : stat.title;
            
            return (
              <div key={i} className="flex flex-col items-center group">
                <div className="bg-teal-50 p-3 rounded-full mb-3 group-hover:bg-teal-100 transition-colors">
                  <Icon className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                  {config.label}
                </h4>
                <p className="text-gray-500 text-sm mt-1">{displayValue}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}