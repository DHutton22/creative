"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button, Input } from "@/components/ui";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

export function Header({ title, showSearch = true, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between gap-4">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-background-secondary transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground-muted" />
        </button>
        {title && (
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
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
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" className="relative p-2">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-xs font-medium rounded-full flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>

        {/* User avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-medium">
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
  );
}


