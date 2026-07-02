import AvatarCard from "../components/Profile/AvatarCard";
import PasswordForm from "../components/Profile/PasswordForm";
import ProfileForm from "../components/Profile/ProfileForm";

const Profile = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Account Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your account settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <AvatarCard />
        <ProfileForm />
        <PasswordForm/>

      </div>

    </div>
  );
};

export default Profile;