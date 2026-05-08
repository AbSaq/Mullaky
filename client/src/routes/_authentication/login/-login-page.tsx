import LeftPanel from "./-left-panel";
import LoginForm from "./-login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen font-sans antialiased bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex">
      <LeftPanel />
      <LoginForm />
    </div>
  );
}
