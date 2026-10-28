import React from 'react';
import { ProfileBuilderContainer } from '../components/profile-builder/ProfileBuilderContainer';
import { DocumentsUploader } from '../components/premium/DocumentsUploader';

export const ProfileEditPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-marathi-cream/20 py-6">
      <ProfileBuilderContainer mode="edit" />
      <DocumentsUploader />
    </div>
  );
};
