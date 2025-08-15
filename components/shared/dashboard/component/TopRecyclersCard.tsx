// components/TopRecyclersCard.tsx
import React, { memo } from 'react';
import Image from 'next/image';
import { FaMedal } from "react-icons/fa";
import { TopUser } from '../../../../components/Types/dashboard.types';
import { MEDAL_COLORS } from '../../../../constants/theme';

interface TopRecyclersCardProps {
  topUsers: TopUser[];
  loading: boolean;
}

const UserAvatar = memo<{ user: TopUser; index: number }>(({ user }) => {
  if (user.imageUrl) {
    return (
      <Image
      alt='user'
        src={user.imageUrl}
        width={32}
        height={32}
        className="md:w-[38px] md:h-[38px] rounded-full border-2 border-green-200 shadow-sm"
        title={user.email}
      />
    );
  }

  return (
    <div
      className="w-8 h-8 md:w-[38px] md:h-[38px] rounded-full border-2 border-green-200 shadow-sm bg-green-100 flex items-center justify-center"
      title={user.email}
    >
   
      <span className="text-green-700 font-bold text-sm md:text-lg">
        {user.name?.charAt(0).toUpperCase()}
      </span>
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

const LoadingUserItem = () => (
  <li className="flex items-center gap-2 md:gap-3 py-2 md:py-3 px-2 rounded-lg animate-pulse">
    <div className="w-6 h-6 bg-gray-200 rounded"></div>
    <div className="w-8 h-8 md:w-[38px] md:h-[38px] bg-gray-200 rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
      <div className="h-2 bg-gray-200 rounded w-full"></div>
    </div>
  </li>
);

const TopRecyclersCard = memo<TopRecyclersCardProps>(({ topUsers, loading }) => {
  const maxPoints = topUsers[0]?.totalPoints || 1;

  const getBackgroundClass = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-r from-yellow-50 to-yellow-100";
      case 1: return "bg-gradient-to-r from-gray-50 to-gray-100";
      case 2: return "bg-gradient-to-r from-orange-50 to-orange-100";
      default: return "hover:bg-green-50";
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ul className="mt-3 space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <LoadingUserItem key={i} />
          ))}
        </ul>
      );
    }

    if (!topUsers || topUsers.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm">No users found</p>
          </div>
        </div>
      );
    }

    return (
      <ul className="mt-3 space-y-2">
        {topUsers.slice(0,3).map((user, idx) => (
          <li
          key={user.userId}
            className={`flex items-center gap-2 md:gap-3 py-2 md:py-3 px-2 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] ${getBackgroundClass(idx)}`}
            
          >
            {/* Rank with Medal */}
            <div className="flex items-center justify-center w-6">

              <span 
                className="font-bold text-sm md:text-lg flex items-center" 
                style={{ color: MEDAL_COLORS[idx] || "#10b981" }}
              >
                {idx < 3 && <FaMedal className="mr-1" />}
                {idx + 1}
              </span>
            </div>

            {/* Avatar */}
            <UserAvatar user={user} index={idx} />

            {/* User Info */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-green-900 truncate text-sm md:text-base">
                {user.name}
              </span>
              <span className="text-xs text-green-500 mb-1">
                {user.totalPoints.toLocaleString()} points
              </span>
              
              {/* Progress Bar */}
              <div className="w-full bg-green-100 rounded-full h-1.5 md:h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.round((user.totalPoints / maxPoints) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Badge for top 3 */}
            {idx < 3 && (
              <div className="text-xs px-2 py-1 rounded-full font-medium" style={{
                backgroundColor: idx === 0 ? '#fef3c7' : idx === 1 ? '#f3f4f6' : '#fed7aa',
                color: idx === 0 ? '#92400e' : idx === 1 ? '#374151' : '#9a3412'
              }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100 flex-1 flex flex-col" style={{ background: "var(--background)" }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm md:text-base font-medium text-green-800">
          Top Recyclers
        </span>
        <button className="text-xs text-green-500 hover:text-green-700 hover:underline transition-colors">
          View All
        </button>
      </div>
      
      {renderContent()}
  
    </div>
  );
});

TopRecyclersCard.displayName = 'TopRecyclersCard';

export default TopRecyclersCard;