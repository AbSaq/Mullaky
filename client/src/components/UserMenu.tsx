import { useLogout } from "../features/auth/logoutMutation";
import type { User } from "../features/auth/types";

export const UserMenu = ({
  user,
  isMobile = false,
}: {
  user: User;
  isMobile?: boolean;
}) => {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const buttonClass = isMobile ? "navbar-mobile-link" : "navbar-login-link";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {user.username}
      </span>
      <button
        onClick={handleLogout}
        className={buttonClass}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};
