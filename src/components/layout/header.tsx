"use client";

import { Bell, Search, Menu, Eye, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button, Input } from "@/components/ui";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

export function Header({ title, showSearch = true, onMenuClick }: HeaderProps) {
  const { user, isImpersonating, originalUser, stopImpersonating } = useAuth();
  const [notifications] = useState(3); // Mock notification count

  return (
    <>
      {/* Impersonation Banner */}
      {isImpersonating && originalUser && (
        <div className="bg-amber-500 text-white px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">
              Viewing as <strong>{user?.name}</strong> ({user?.role})
            </span>
          </div>
          <span className="text-xs sm:text-sm opacity-80 hidden md:inline">
            — You are logged in as {originalUser.name}
          </span>
          <button
            onClick={stopImpersonating}
            className="sm:ml-4 flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            <span className="hidden sm:inline">Exit View</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      )}
      <header className="h-16 bg-white border-b border-border px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4">
      {/* Left side */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="menu-toggle-btn p-2 rounded-lg hover:bg-background-secondary transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-foreground-muted" />
        </button>
        {title && (
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="flex-1 max-w-md hidden md:block">
          <Input
            placeholder="Search machines, checklists..."
            leftIcon={<Search className="w-5 h-5" />}
            className="bg-background-secondary border-transparent"
          />
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Notifications */}
        <Button variant="ghost" className="relative p-2">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 bg-danger text-white text-xs font-medium rounded-full flex items-center justify-center">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </Button>

        {/* User avatar */}
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-border">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-foreground-muted capitalize">
              {user?.role || "operator"}
            </p>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}


