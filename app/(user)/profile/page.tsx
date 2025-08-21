// ProfilePage.tsx - Main component (simplified)
"use client";

import React, { Suspense } from "react";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import Loader from "@/components/common/Loader";
import ReviewManager from "@/components/profile/ReviewManager";
import ProfileContent from "@/components/profile/profileContent";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loader title="Loading profile..." />}>
        <ReviewManager>
          {({
            openReviewModal,
            deleteReview,
            userReviews,
            isReviewsLoading,
          }) => (
            <ProfileContent
              openReviewModal={openReviewModal}
              deleteReview={deleteReview}
              userReviews={userReviews}
              isReviewsLoading={isReviewsLoading}
            />
          )}
        </ReviewManager>
      </Suspense>
    </ProtectedRoute>
  );
}
