import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  LayoutDashboard,
  Calendar,
  Building2,
  FileText,
  Pill,
  Clock,
  Share2,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Unread notification count
  const { data: notifData } = useQuery<{ unreadCount: number }>({
    queryKey: ['unread-notifications'],
    queryFn: () => api.get<{ unreadCount: number }>('/notifications/unread-count'),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role specific menu items
  const patientNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Find Care', path: '/find-care', icon: Building2 },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Medical Reports', path: '/reports', icon: FileText },
    { label: 'Medicine Tracker', path: '/medicines', icon: Pill },
    { label: 'Follow-ups', path: '/follow-ups', icon: Clock },
    { label: 'Share Records', path: '/sharing', icon: Share2 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const doctorNav = [
    { label: 'Doctor Workspace', path: '/doctor', icon: Stethoscope },
    { label: 'Find Care & Directory', path: '/find-care', icon: Building2 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
    { label: 'Hospitals Directory', path: '/find-care', icon: Building2 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const navItems =
    user?.role === 'ADMIN'
      ? adminNav
      : user?.role === 'DOCTOR'
      ? doctorNav
      : patientNav;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Academic Project Identity Banner */}
      <div className="bg-brand-navy text-slate-300 text-xs py-1.5 px-4 border-b border-brand-navy-light flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-teal animate-pulse"></span>
          <span className="font-semibold text-white">Providence College of Engineering</span>
          <span className="hidden sm:inline">• Dept of CSE • Course: PBLCST304 (OOP)</span>
          <span className="hidden md:inline">• Guide: Chitra Mohan</span>
        </div>
        <div className="text-slate-400 text-[11px] hidden lg:block">
          Team: Deepak Biju, Avanthika Aneesh, Henin Alosius, Aman M, Aron George Daniel
        </div>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-brand-teal shadow-md shadow-brand-navy/10">
                <Activity className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-brand-navy">SMART</span>
                <span className="text-xl font-bold tracking-tight text-brand-teal ml-1">PATIENT</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-brand-panel text-brand-navy rounded-md border border-brand-border">
                  Health System
                </span>
              </div>
            </Link>
          </div>

          {/* User profile & quick actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-brand-navy hover:bg-slate-100 transition duration-150"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-brand-border">
              <div className="w-9 h-9 rounded-xl bg-brand-panel border border-brand-border flex items-center justify-center text-brand-navy font-semibold text-sm">
                {user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold text-brand-navy flex items-center gap-1.5">
                  {user?.fullName}
                  {user?.role && (
                    <Badge variant={user.role === 'ADMIN' ? 'error' : user.role === 'DOCTOR' ? 'teal' : 'primary'} size="sm">
                      {user.role}
                    </Badge>
                  )}
                </div>
                {user?.patientCode && (
                  <span className="text-xs font-mono text-brand-muted">{user.patientCode}</span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-slate-500 hover:text-brand-error hover:bg-rose-50 transition duration-150"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-brand-border p-3 shadow-sm">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                      isActive
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'text-slate-600 hover:bg-brand-bg hover:text-brand-navy'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-brand-teal text-white' : 'bg-brand-panel text-brand-navy'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Patient ID Card */}
            {user?.patientCode && (
              <div className="mt-6 p-3.5 rounded-xl bg-brand-panel/60 border border-brand-border/80">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-brand-muted">
                  Your Digital ID
                </div>
                <div className="text-base font-bold font-mono text-brand-navy mt-0.5">
                  {user.patientCode}
                </div>
                <div className="text-[11px] text-brand-muted mt-1">
                  Share only with verified doctors during consultation.
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full p-4 flex flex-col shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-brand-teal" />
                  <span className="font-bold text-brand-navy">SMART PATIENT</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-brand-border">
                <div className="font-medium text-brand-navy">{user?.fullName}</div>
                <div className="text-xs text-brand-muted font-mono">{user?.patientCode || user?.email}</div>
                <Badge variant="teal" size="sm" className="mt-1.5">
                  {user?.role}
                </Badge>
              </div>

              <nav className="space-y-1.5 mt-4 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-brand-navy text-white'
                          : 'text-slate-600 hover:bg-brand-bg hover:text-brand-navy'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-error text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-4 flex items-center space-x-2 text-brand-error p-3 rounded-xl hover:bg-rose-50 text-sm font-medium w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out securely</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

