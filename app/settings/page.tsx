import { ChangePasswordForm } from "@/app/components/ChangePasswordForm";
import { Navigation } from "@/app/components/Navigation";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
