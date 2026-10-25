import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '2004-01-15',
    phone: '',
    bloodGroup: 'O+',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    consent: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!formData.consent) {
      setErrorMessage('You must acknowledge consent to proceed.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const auth = await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        consent: formData.consent,
      });

      if (auth.patientCode) {
        setCreatedPatientId(auth.patientCode);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check form inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  if (createdPatientId) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-brand-navy">Registration Successful!</h2>
            <p className="text-sm text-brand-muted mt-2">
              Your digital patient record has been securely created in MySQL.
            </p>
          </div>

          <div className="p-4 bg-brand-panel rounded-2xl border border-brand-border text-center">
            <div className="text-xs uppercase tracking-wider text-brand-muted font-semibold">
              Your Permanent Patient ID
            </div>
            <div className="text-2xl font-mono font-bold text-brand-navy mt-1 tracking-wider">
              {createdPatientId}
            </div>
            <div className="text-xs text-brand-muted mt-1.5">
              Please save this ID. You will share this ID with verified doctors.
            </div>
          </div>

          <Button
            variant="teal"
            size="lg"
            className="w-full"
            onClick={() => navigate('/dashboard')}
            icon={<ArrowRight className="w-4 h-4 ml-1" />}
          >
            Enter Patient Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Activity className="w-6 h-6 text-brand-teal" />
            <span className="text-xl font-bold text-brand-navy">SMART PATIENT</span>
          </Link>
          <h2 className="mt-3 text-3xl font-extrabold text-brand-navy">
            Create Your Health Account
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Generate a unique Patient ID and take control of your health records
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-brand-border shadow-xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-brand-error text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="fullName"
                required
                placeholder="e.g. Deepak Biju"
                value={formData.fullName}
                onChange={handleChange}
              />
              <Input
                label="Username"
                name="username"
                required
                placeholder="e.g. deepak2026"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                placeholder="e.g. deepak@student.edu"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Allergies (Optional)"
              name="allergies"
              placeholder="e.g. Penicillin, Peanuts, Dust (leave empty if none)"
              value={formData.allergies}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Name"
                name="emergencyContactName"
                placeholder="e.g. George Biju"
                value={formData.emergencyContactName}
                onChange={handleChange}
              />
              <Input
                label="Emergency Contact Phone"
                name="emergencyContactPhone"
                type="tel"
                placeholder="+91 94471 23456"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-brand-border text-brand-teal focus:ring-brand-teal"
                />
                <span className="text-xs text-brand-muted leading-relaxed">
                  I acknowledge that personal health data stored in Smart Patient is encrypted, patient-owned, and accessible to medical personnel solely with my explicit, revocable authorization.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="teal"
              size="lg"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              Register & Generate Patient ID
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-brand-muted">
            Already have a Patient ID?{' '}
            <Link to="/login" className="font-semibold text-brand-teal hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
