import React from 'react';
import { Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  pivot?: {
    awarded_at: string;
  };
}

interface BadgeDisplayProps {
  badges: Badge[];
  detailed?: boolean;
  maxDisplay?: number;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  detailed = false,
  maxDisplay,
}) => {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay && badges.length > maxDisplay 
    ? badges.length - maxDisplay 
    : 0;

  if (badges.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>No badges earned yet</p>
      </div>
    );
  }

  if (detailed) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayBadges.map((badge) => (
          <Card key={badge.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`text-4xl shrink-0`}>
                {badge.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{badge.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full bg-${badge.color}-100 text-${badge.color}-700`}>
                    +{badge.points} points
                  </span>
                  {badge.pivot && (
                    <span className="text-xs text-gray-500">
                      Earned {new Date(badge.pivot.awarded_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-gray-700">Badges:</span>
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          title={`${badge.name} - ${badge.description}`}
        >
          <span className="text-lg">{badge.icon}</span>
          <span className="text-xs font-medium">{badge.name}</span>
        </div>
      ))}
      {remainingCount > 0 && (
        <span className="text-sm text-gray-500">+{remainingCount} more</span>
      )}
    </div>
  );
};