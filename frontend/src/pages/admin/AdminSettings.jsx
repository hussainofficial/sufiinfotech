import ChangePasswordForm from '../../components/ChangePasswordForm';

export default function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Settings</h1>
      <ChangePasswordForm />
    </div>
  );
}
