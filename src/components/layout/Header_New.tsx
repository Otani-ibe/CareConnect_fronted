import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, User, LogOut, Menu, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 font-bold text-2xl text-primary hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-white fill-current" />
            </div>
            <span className="hidden sm:block">CareConnect</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              {/* Navigation */}
              <nav className="hidden lg:flex items-center gap-8">
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  Dashboard
                </Link>
                {user.role === 'senior' && (
                  <Link 
                    to="/find-caregivers" 
                    className="text-sm font-medium text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-primary/5"
                  >
                    Find Caregivers
                  </Link>
                )}
                <Link 
                  to="/sessions" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  Sessions
                </Link>
                <Link 
                  to="/messages" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-primary/5"
                >
                  Messages
                </Link>
              </nav>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 h-auto"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  {user.role === 'senior' && (
                    <DropdownMenuItem asChild>
                      <Link to="/find-caregivers" className="cursor-pointer">Find Caregivers</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/sessions" className="cursor-pointer">Sessions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="cursor-pointer">Messages</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                asChild 
                variant="ghost" 
                className="text-gray-700 hover:text-primary hover:bg-primary/5"
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button 
                asChild 
                className="bg-primary hover:bg-primary/90 text-white shadow-sm"
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
