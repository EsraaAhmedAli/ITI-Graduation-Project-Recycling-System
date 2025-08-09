// components/providers/UserPointsWrapper.tsx
'use client';

import { useUserAuth } from "@/context/AuthFormContext";
import { UserPointsProvider } from "@/context/UserPointsContext";

interface UserPointsWrapperProps {
  children: React.ReactNode;
}

export default function UserPointsWrapper({ children }: UserPointsWrapperProps) {
  const { user } = useUserAuth(); // Adjust this based on your auth context structure
  
  return (
    <UserPointsProvider 
      userId={user?._id } // Adjust field names based on your user object
      name={user?.name}
      email={user?.email}
    >
      {children}
    </UserPointsProvider>
  );
}