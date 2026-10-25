import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserCheck, 
  Building2, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  History, 
  AlertTriangle,
  Lock,
  Hospital as HospitalIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { apiClient } from '../../lib/api-client';
import { AdminStats, Doctor, AdminUser, AuditLog, Hospital } from '../../types';

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'hospitals' | 'audit'>('pending');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');
  
  // Reject Doctor Dialog State
  const [rejectDoctorId, setRejectDoctorId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Medical license documentation could not be verified.');
  
  // Add Hospital Dialog State
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    description: '',
    digitalReportsSupported: true,
    applicationBookingSupported: true
  });
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Queries
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/api/admin/stats')
  });

  const { data: pendingDoctors, isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['admin-pending-doctors'],
    queryFn: () => apiClient.get('/api/admin/doctors/pending')
  });

  const { data: users, isLoading: loadingUsers } = useQuery<AdminUser[]>({
    queryKey: ['admin-users', userRoleFilter],
    queryFn: () => {
      const param = userRoleFilter !== 'ALL' ? `?role=${userRoleFilter}` : '';
      return apiClient.get(`/api/admin/users${param}`);
    }
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ['hospitals'],
    queryFn: () => apiClient.get('/api/hospitals')
  });

  const { data: auditLogs, isLoading: loadingAudit } = useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: () => apiClient.get('/api/admin/audit-logs'),
    enabled: activeTab === 'audit'
  });

  // Mutations
  const approveDoctorMutation = useMutation({
    mutationFn: (doctorId: number) => apiClient.post(`/api/admin/doctors/${doctorId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setActionMessage({ type: 'success', text: 'Doctor approved successfully. Doctor role and clinical permissions enabled.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to approve doctor.' });
    }
  });

  const rejectDoctorMutation = useMutation({
    mutationFn: ({ doctorId, reason }: { doctorId: number; reason: string }) => 
      apiClient.post(`/api/admin/doctors/${doctorId}/reject`, { reason }),
    onSuccess: () => {
      setRejectDoctorId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setActionMessage({ type: 'success', text: 'Doctor verification request rejected with reason recorded.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to reject doctor.' });
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, newStatus }: { userId: number; newStatus: 'ACTIVE' | 'SUSPENDED' }) => 
      apiClient.patch(`/api/admin/users/${userId}/status`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActionMessage({ type: 'success', text: 'User account status updated successfully.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to update user status.' });
    }
  });

  const createHospitalMutation = useMutation({
    mutationFn: (hospitalData: any) => apiClient.post('/api/admin/hospitals', hospitalData),
    onSuccess: () => {
      setShowAddHospital(false);
      setNewHospital({
        name: '',
        address: '',
        city: '',
        phone: '',
        description: '',
        digitalReportsSupported: true,
        applicationBookingSupported: true
      });
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setActionMessage({ type: 'success', text: 'New partner hospital registered successfully.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to add hospital.' });
    }
  });

  const filteredUsers = (users || []).filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900">System Administration & Governance</h1>
            <Badge variant="primary">ADMIN PORTAL</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Account governance, medical practitioner verification, hospital networks & security audit compliance.
          </p>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between animate-fade-in ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
            <span className="text-sm font-medium">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-navy-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Patients</p>
              <h3 className="text-2xl font-extrabold text-navy-900 mt-1">{stats?.totalPatients ?? 0}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Encrypted health profiles</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-700">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-teal-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Doctors</p>
              <h3 className="text-2xl font-extrabold text-navy-900 mt-1">{stats?.totalDoctors ?? 0}</h3>
              <p className="text-xs text-teal-600 font-medium mt-0.5">Verified clinicians</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Doctor Approvals</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingDoctorVerifications ?? 0}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Awaiting credential check</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-indigo-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner Hospitals</p>
              <h3 className="text-2xl font-extrabold text-navy-900 mt-1">{stats?.totalHospitals ?? 0}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Connected facilities</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Pending Doctor Verifications
            {(stats?.pendingDoctorVerifications ?? 0) > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {stats?.pendingDoctorVerifications}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'users'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            User Account Management
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'hospitals'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <HospitalIcon className="w-4 h-4" />
            Hospital Directory
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            Security & Audit Logs
          </button>
        </nav>
      </div>

      {/* Tab 1: Pending Doctor Verifications */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-sm">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Doctor Verification Policy</p>
              <p className="text-amber-800 text-xs mt-0.5">
                Doctors cannot approve themselves. Unverified doctors are strictly prevented from consulting, prescribing, or accessing patient records until verified by an administrator.
              </p>
            </div>
          </div>

          {loadingDoctors ? (
            <div className="p-8 text-center text-slate-400">Loading pending applications...</div>
          ) : !pendingDoctors || pendingDoctors.length === 0 ? (
            <Card className="text-center p-12">
              <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-navy-900">All Doctor Accounts Verified</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                There are currently no doctor accounts awaiting verification. New medical practitioners will appear here upon registration.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDoctors.map((doc) => (
                <Card key={doc.doctorId} className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-navy-900">{doc.fullName}</CardTitle>
                        <p className="text-sm text-teal-700 font-medium">{doc.specialty}</p>
                      </div>
                      <Badge variant="warning">PENDING VERIFICATION</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Qualification:</span>
                        <span className="font-semibold text-slate-700">{doc.qualification || 'MBBS'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Medical License / Ref:</span>
                        <span className="font-mono font-semibold text-slate-700">{doc.licenseOrRegistrationReference || 'N/A'}</span>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="text-slate-400 block">Affiliated Hospital:</span>
                        <span className="font-medium text-slate-800">{doc.hospital?.name || 'Unassigned / Independent'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => approveDoctorMutation.mutate(doc.doctorId)}
                        isLoading={approveDoctorMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Approve Doctor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setRejectDoctorId(doc.doctorId);
                          setRejectReason('Medical council registration certificate could not be validated.');
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Account Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-slate-500 font-medium">Role:</span>
              {['ALL', 'PATIENT', 'DOCTOR', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    userRoleFilter === role
                      ? 'bg-navy-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Loading user accounts...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No users found matching query.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-navy-900">{u.username}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.role === 'ADMIN' ? 'error' : u.role === 'DOCTOR' ? 'primary' : 'default'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.accountStatus === 'ACTIVE' ? 'success' : u.accountStatus === 'SUSPENDED' ? 'error' : 'warning'}>
                            {u.accountStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial Setup'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== 'ADMIN' && (
                            <Button
                              size="sm"
                              variant={u.accountStatus === 'ACTIVE' ? 'outline' : 'primary'}
                              className={u.accountStatus === 'ACTIVE' ? 'text-red-600 border-red-200 hover:bg-red-50 text-xs h-7' : 'text-xs h-7'}
                              onClick={() => {
                                const nextStatus = u.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                                toggleUserStatusMutation.mutate({ userId: u.userId, newStatus: nextStatus });
                              }}
                              isLoading={toggleUserStatusMutation.isPending}
                            >
                              {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Hospital Directory */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Partner Healthcare Institutions</h2>
              <p className="text-xs text-slate-500">Facilities participating in digital records and slot scheduling.</p>
            </div>
            <Button size="sm" onClick={() => setShowAddHospital(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Partner Hospital
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(hospitals || []).map((h) => (
              <Card key={h.hospitalId}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-bold text-navy-900">{h.name}</CardTitle>
                    <Badge variant={h.activeStatus ? 'success' : 'default'}>
                      {h.activeStatus ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </div>
                  <p className="text-xs text-teal-700 font-medium">{h.city}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-600">
                  <p>{h.address}</p>
                  <p className="font-mono text-slate-500">Contact: {h.phone}</p>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Badge variant="info" className="text-[10px]">
                      {h.digitalReportsSupported ? '✓ Digital Reports' : 'Manual Only'}
                    </Badge>
                    <Badge variant="primary" className="text-[10px]">
                      {h.applicationBookingSupported ? '✓ Online Booking' : 'Walk-in'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security & Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-blue-900 text-sm">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Regulatory Privacy & Least-Privilege Architecture</p>
              <p className="text-blue-800 text-xs mt-0.5">
                In adherence to healthcare security standards, administrators cannot view or download private medical documents. Audit trails record administrative actor actions, authentications, and permission events without logging confidential diagnostic data or passwords.
              </p>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Actor ID</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {loadingAudit ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">Loading security audit trails...</td>
                    </tr>
                  ) : !auditLogs || auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">No audit events recorded yet.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.auditId} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-navy-900">
                          {log.actionType}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">
                          {log.resourceType} {log.resourceId && `[#${log.resourceId}]`}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {log.actorUserId ? `User #${log.actorUserId}` : 'SYSTEM'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.outcome === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.outcome}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate" title={log.metadata}>
                          {log.metadata || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Doctor Dialog */}
      <Dialog isOpen={rejectDoctorId !== null} onClose={() => setRejectDoctorId(null)}>
        <DialogHeader>
          <DialogTitle>Reject Doctor Application</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Please provide an audited rationale for rejecting this medical practitioner's verification request. The doctor will be notified to resubmit authentic credentials.
          </p>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Rejection</label>
            <textarea
              className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Medical registration number not found on state council registry."
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectDoctorId(null)}>Cancel</Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              if (rejectDoctorId) {
                rejectDoctorMutation.mutate({ doctorId: rejectDoctorId, reason: rejectReason });
              }
            }}
            isLoading={rejectDoctorMutation.isPending}
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Hospital Dialog */}
      <Dialog isOpen={showAddHospital} onClose={() => setShowAddHospital(false)}>
        <DialogHeader>
          <DialogTitle>Add Partner Hospital Institution</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <Input
            label="Hospital / Clinic Name"
            placeholder="e.g. Metro Medical Center"
            value={newHospital.name}
            onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City / District"
              placeholder="e.g. Kochi"
              value={newHospital.city}
              onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
              required
            />
            <Input
              label="Contact Phone"
              placeholder="+91 484 2234567"
              value={newHospital.phone}
              onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })}
              required
            />
          </div>
          <Input
            label="Full Physical Address"
            placeholder="Main Road, Medical Enclave, City"
            value={newHospital.address}
            onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
            required
          />
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Hospital Description & Specialties</label>
            <textarea
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={2}
              placeholder="Multi-speciality tertiary care center with 24/7 emergency..."
              value={newHospital.description}
              onChange={(e) => setNewHospital({ ...newHospital, description: e.target.value })}
            />
          </div>
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newHospital.digitalReportsSupported}
                onChange={(e) => setNewHospital({ ...newHospital, digitalReportsSupported: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              Support digital laboratory/scan report management
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newHospital.applicationBookingSupported}
                onChange={(e) => setNewHospital({ ...newHospital, applicationBookingSupported: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              Support online doctor slot booking in Smart Patient
            </label>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddHospital(false)}>Cancel</Button>
          <Button
            onClick={() => createHospitalMutation.mutate(newHospital)}
            isLoading={createHospitalMutation.isPending}
            disabled={!newHospital.name || !newHospital.city}
          >
            Save Hospital Record
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
