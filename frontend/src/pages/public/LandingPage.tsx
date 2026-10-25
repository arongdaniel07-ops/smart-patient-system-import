import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Activity,
  FileText,
  Calendar,
  Pill,
  Share2,
  Lock,
  CheckCircle2,
  ArrowRight,
  Building2,
  Stethoscope,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      {/* College Project Top Banner */}
      <div className="bg-brand-navy text-slate-300 text-xs py-2 px-4 border-b border-brand-navy-light text-center">
        <span className="font-semibold text-white">Providence College of Engineering</span> • Department of Computer Science & Engineering • Course: PBLCST304 (Object Oriented Programming) • Guide: Chitra Mohan
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-brand-teal shadow-md shadow-brand-navy/10">
              <Activity className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-navy">SMART</span>
              <span className="text-xl font-bold tracking-tight text-brand-teal ml-1">PATIENT</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-brand-muted">
            <a href="#features" className="hover:text-brand-navy transition">Features</a>
            <a href="#how-it-works" className="hover:text-brand-navy transition">How It Works</a>
            <a href="#privacy" className="hover:text-brand-navy transition">Patient Control & Privacy</a>
            <a href="#academic" className="hover:text-brand-navy transition">Academic Context</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="teal" size="sm">
                Create Patient ID
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-brand-border bg-gradient-to-b from-white to-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-panel border border-brand-border text-xs font-semibold text-brand-navy">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                <span>Patient-Centred Digital Health Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-navy leading-[1.15]">
                Your Health Records. <br />
                <span className="text-brand-teal">One Secure Place.</span>
              </h1>

              <p className="text-lg text-brand-muted max-w-2xl leading-relaxed">
                Empowering patients with full ownership of their medical history. Link hospital visits, compare laboratory results side-by-side, track daily medicine schedules, and grant temporary, revocable access to verified doctors.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/register">
                  <Button variant="teal" size="lg" icon={<ArrowRight className="w-5 h-5 ml-1" />}>
                    Get Your Patient ID
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Demonstration Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-border text-xs text-brand-muted">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Unique Patient ID</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Revocable Doctor Sharing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Numerical Lab Comparison</span>
                </div>
              </div>
            </div>

            {/* Live Interactive UI Component Preview */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal to-brand-navy-light rounded-3xl blur-lg opacity-20"></div>
                <div className="relative bg-white rounded-2xl border border-brand-border shadow-xl p-5 space-y-4">
                  {/* Mock Patient Card */}
                  <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-panel text-brand-navy font-bold flex items-center justify-center">
                        DB
                      </div>
                      <div>
                        <div className="font-semibold text-brand-navy text-sm">Deepak Biju</div>
                        <div className="text-xs font-mono text-brand-muted">PT-2026-0001 • Blood: O+</div>
                      </div>
                    </div>
                    <Badge variant="success">Active Record</Badge>
                  </div>

                  {/* Mock Summary Cards Preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-brand-panel/60 rounded-xl border border-brand-border/60">
                      <div className="text-[11px] text-brand-muted font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-teal" /> Next Visit
                      </div>
                      <div className="text-xs font-bold text-brand-navy mt-1">Oct 27, 10:00 AM</div>
                      <div className="text-[10px] text-brand-muted">Dr. Rajesh Sharma (Cardio)</div>
                    </div>
                    <div className="p-3 bg-brand-panel/60 rounded-xl border border-brand-border/60">
                      <div className="text-[11px] text-brand-muted font-medium flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-brand-teal" /> Doses Today
                      </div>
                      <div className="text-xs font-bold text-brand-navy mt-1">1 of 2 Taken</div>
                      <div className="text-[10px] text-brand-success font-medium">On Track (50%)</div>
                    </div>
                  </div>

                  {/* Mock Lab Comparison Row */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-brand-navy flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-brand-teal" /> Total Cholesterol Delta
                      </span>
                      <span className="text-[11px] font-bold text-brand-success bg-emerald-100 px-1.5 py-0.5 rounded">
                        -17.8% (Improved)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-brand-muted">
                      <span>Baseline: 225 mg/dL</span>
                      <span className="font-semibold text-brand-navy">Follow-up: 185 mg/dL</span>
                    </div>
                  </div>

                  {/* Mock Active Share Code */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-brand-navy text-white text-xs">
                    <div>
                      <div className="text-[10px] text-slate-300">Active Doctor Access Code</div>
                      <div className="font-mono font-bold tracking-wider text-brand-teal text-sm">SH-48K2Q9</div>
                    </div>
                    <div className="text-[10px] text-right text-slate-300">
                      <span>Expires in 72h</span>
                      <div className="text-rose-300 underline cursor-pointer">Instant Revoke</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-brand-teal">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-navy mt-2">
              Designed from the Patient's Perspective
            </p>
            <p className="text-brand-muted mt-3">
              Unlike internal hospital administration software, Smart Patient puts you in direct control of every medical encounter, document, and doctor authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hoverEffect>
              <div className="w-12 h-12 rounded-xl bg-brand-panel flex items-center justify-center text-brand-navy mb-4">
                <FileText className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">One Digital Health Record</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                All your clinical reports, imaging scans, and prescriptions bound to your permanent Patient ID across every visited hospital.
              </p>
            </Card>

            <Card hoverEffect>
              <div className="w-12 h-12 rounded-xl bg-brand-panel flex items-center justify-center text-brand-navy mb-4">
                <TrendingUp className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Laboratory Report Comparison</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                Select any two historical blood tests. The system computes numerical deltas, percentage shifts, and reference range status side-by-side.
              </p>
            </Card>

            <Card hoverEffect>
              <div className="w-12 h-12 rounded-xl bg-brand-panel flex items-center justify-center text-brand-navy mb-4">
                <Share2 className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Patient-Controlled Sharing</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                Grant temporary, scoped access to verified doctors using single-use codes (e.g. SH-48K2Q9). Revoke permissions anytime with immediate backend enforcement.
              </p>
            </Card>

            <Card hoverEffect>
              <div className="w-12 h-12 rounded-xl bg-brand-panel flex items-center justify-center text-brand-navy mb-4">
                <Calendar className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Appointment Management</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                Discover affiliated doctors and hospitals, view real-time 30-minute slot availability, book with instant token generation, and manage cancellations.
              </p>
            </Card>

            <Card hoverEffect>
              <div className="w-12 h-12 rounded-xl bg-brand-panel flex items-center justify-center text-brand-navy mb-4">
                <Pill className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Medicine & Dose Tracking</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                View doctor-prescribed medications with auto-generated Morning, Afternoon, Evening schedules. Mark doses as Taken or Missed with full audit history.
              </p>
            </Card>

            <Card hoverEffect>
              <div className="w-12 h-12 rounded-xl bg-brand-panel flex items-center justify-center text-brand-navy mb-4">
                <Clock className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Chronological ID Timeline</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                Unified audit trail of every medical event: registration, bookings, consultation notes, report uploads, doses, and permissions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-brand-bg border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-brand-teal">Simple 3-Step Workflow</h2>
            <p className="text-3xl font-extrabold text-brand-navy mt-2">How Smart Patient Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-brand-navy text-brand-teal font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Register & Get Patient ID</h3>
              <p className="text-sm text-brand-muted mt-2">
                Create your account and receive a unique identifier (e.g., PT-2026-0001). Upload your past laboratory reports, scans, and emergency information.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-brand-teal text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Book Care & Consult</h3>
              <p className="text-sm text-brand-muted mt-2">
                Search verified doctors across hospitals. Confirm appointment slots, receive a digital token, and share your records securely during consultation.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-brand-navy text-brand-teal font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Track & Compare</h3>
              <p className="text-sm text-brand-muted mt-2">
                Receive digital prescriptions, mark daily doses, view recommended follow-up visits, and compare laboratory changes over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy and Patient Control Section */}
      <section id="privacy" className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-teal text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Strict Security Policy
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Your Health Data Belongs to You. Not the Hospital.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Doctors cannot inspect your medical history simply by guessing your ID. Document downloads are guarded by private storage tokens and validated on every byte stream against active, non-expired sharing grants. Administrators are restricted from downloading private clinical files.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button variant="teal" size="md">
                    Create Your Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="md" className="border-white/20 text-white hover:bg-white/10">
                    Sign In to Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Project Credits */}
      <footer id="academic" className="bg-brand-bg py-12 border-t border-brand-border text-xs text-brand-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-brand-teal" />
                <span className="font-bold text-base text-brand-navy">SMART PATIENT</span>
              </div>
              <p className="text-slate-500 max-w-sm">
                Academic Micro-Project demonstrating practical Object-Oriented Programming (OOP) concepts alongside modern full-stack healthcare web engineering.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-brand-navy text-sm mb-2">Academic Institution</h4>
              <p className="font-medium text-slate-700">Providence College of Engineering</p>
              <p className="text-slate-500">Department of Computer Science & Engineering</p>
              <p className="text-slate-500">Course: PBLCST304 — OOP (Semester 3)</p>
              <p className="text-slate-500 font-medium mt-1">Guide: Chitra Mohan</p>
            </div>

            <div>
              <h4 className="font-semibold text-brand-navy text-sm mb-2">Development Team</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Deepak Biju</li>
                <li>• Avanthika Aneesh</li>
                <li>• Henin Alosius</li>
                <li>• Aman M</li>
                <li>• Aron George Daniel</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>© 2026 Smart Patient Health & Hospital Management System. Academic Demonstration.</div>
            <div className="text-slate-500">Not affiliated with real hospital systems or commercial health databases.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
