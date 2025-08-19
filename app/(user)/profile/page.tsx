"use client";

import React, { Suspense } from "react";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import Loader from "@/components/common/Loader";
import dynamic from "next/dynamic";

// Dynamic imports for better code splitting
const ReviewManager = dynamic(() => import("@/components/profile/ReviewManager"), {
  loading: () => <Loader title="" />,
  ssr: false
});

const ProfileContent = dynamic(() => import("../../../components/profile/profileContent"), {
  loading: () => <Loader title=" profile..." />,
  ssr: false
});

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loader title="Loading profile..." />}>
        <ReviewManager>
          {({ openReviewModal, deleteReview, userReviews, isReviewsLoading }) => (
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