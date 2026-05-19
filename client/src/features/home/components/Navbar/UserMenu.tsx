import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { UserStatusResponse } from "../../../auth/queries/userQueries.ts";

interface UserMenuProps {
  user: UserStatusResponse;
  isMobile?: boolean;
}

export const UserMenu = ({ user, isMobile = false }: UserMenuProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Flush local storage tokens to clear authorization context headers
    localStorage.removeItem("token");
    localStorage.removeItem("pendingEmail");

    // 2. Clear out the query cache immediately so all navbar elements update synchronously
    queryClient.setQueryData(["userStatus"], {
      isAuthenticated: false,
      isVerified: false,
      role: "user",
      targetRoute: "/login",
    });

    // 3. Kick them back out to the entry point
    navigate({ to: "/login" });
  };

  const buttonClass = isMobile ? "navbar-mobile-link" : "navbar-login-link";

  // Safely grab the fullName or email from the nested user block, with a clean placeholder fallback
  const userDisplayName = user.user?.fullName || user.user?.email || "Account";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/select-building" })}
        className={`${buttonClass} cursor-pointer`}
      >
        Dashboard
      </button>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {userDisplayName}
      </span>
      <button
        onClick={handleLogout}
        className={`${buttonClass} cursor-pointer`}
      >
        Logout
      </button>
    </div>
  );
};
