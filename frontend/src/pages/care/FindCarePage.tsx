import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Hospital, Doctor } from '../../types';
import {
  Building2,
  Stethoscope,
  Search,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';

export const FindCarePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals'>('doctors');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('ALL');

  // Query Hospitals
  const { data: hospitals = [], isLoading: isHospitalsLoading } = useQuery<Hospital[]>({
    queryKey: ['hospitals', searchTerm],
    queryFn: () => api.get<Hospital[]>(`/hospitals?search=${encodeURIComponent(searchTerm)}`),
  });

  // Query Specialties
  const { data: specialties = [] } = useQuery<string[]>({
    queryKey: ['specialties'],
    queryFn: () => api.get<string[]>('/doctors/specialties'),
  });

  // Query Doctors
  const { data: doctors = [], isLoading: isDoctorsLoading } = useQuery<Doctor[]>({
    queryKey: ['doctors', selectedSpecialty, selectedHospitalId, searchTerm],
    queryFn: () => {
      let url = `/doctors?`;
      if (selectedSpecialty !== 'ALL') url += `specialty=${encodeURIComponent(selectedSpecialty)}&`;
      if (selectedHospitalId !== 'ALL') url += `hospitalId=${selectedHospitalId}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}`;
      return api.get<Doctor[]>(url);
    },
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('ALL');
    setSelectedHospitalId('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Find Care & Directory</h1>
        <p className="text-sm text-brand-muted mt-1">
          Discover verified doctors, accredited hospitals, and available consultation slots.
        </p>
      </div>

      {/* Tabs & Search Filter Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-brand-border">
          {/* Tab buttons */}
          <div className="flex bg-brand-panel p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'doctors'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>Verified Doctors ({doctors.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'hospitals'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Hospitals ({hospitals.length})</span>
              </div>
            </button>
          </div>

          {(searchTerm || selectedSpecialty !== 'ALL' || selectedHospitalId !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-muted hover:text-brand-error flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by doctor name, specialty, or hospital city..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="ALL">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
            >
              <option value="ALL">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.hospitalId} value={h.hospitalId}>
                  {h.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Content View: Doctors or Hospitals */}
      {activeTab === 'doctors' ? (
        <div>
          {isDoctorsLoading ? (
            <div className="py-12 text-center text-sm text-brand-muted">Searching doctors...</div>
          ) : doctors.length === 0 ? (
            <Card className="py-12 text-center">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-brand-navy">No doctors found</h3>
              <p className="text-xs text-brand-muted mt-1">Try broadening your search term or clearing filters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <Card key={doctor.doctorId} hoverEffect className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-panel text-brand-navy font-bold flex items-center justify-center text-base border border-brand-border shrink-0">
                          Dr
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-brand-navy flex items-center gap-1.5">
                            {doctor.fullName}
                            <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                          </h3>
                          <Badge variant="teal" size="sm" className="mt-0.5">
                            {doctor.specialty}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-brand-muted">
                      <div>
                        <span className="font-medium text-brand-navy">Qualification:</span>{' '}
                        {doctor.qualification}
                      </div>
                      {doctor.hospital && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-brand-teal" />
                          <span>
                            {doctor.hospital.name} ({doctor.hospital.city})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between">
                    <span className="text-[11px] text-brand-success font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span>
                      30-Min Slots Available
                    </span>
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() =>
                        navigate(`/appointments?bookDoctorId=${doctor.doctorId}&hospitalId=${doctor.hospital?.hospitalId || 1}`)
                      }
                      icon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      Book Visit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {isHospitalsLoading ? (
            <div className="py-12 text-center text-sm text-brand-muted">Loading hospitals...</div>
          ) : hospitals.length === 0 ? (
            <Card className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-brand-navy">No hospitals found</h3>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map((hospital) => (
                <Card key={hospital.hospitalId} hoverEffect className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-brand-navy leading-tight">
                          {hospital.name}
                        </h3>
                        <span className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {hospital.city}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-brand-muted line-clamp-3 leading-relaxed mb-4">
                      {hospital.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3 text-xs text-brand-muted">
                      <Phone className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{hospital.phone || '+91 484 200 0000'}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hospital.digitalReportsSupported && (
                        <Badge variant="teal" size="sm">Digital Reports</Badge>
                      )}
                      {hospital.applicationBookingSupported && (
                        <Badge variant="primary" size="sm">Online Slots</Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-brand-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedHospitalId(hospital.hospitalId.toString());
                        setActiveTab('doctors');
                      }}
                    >
                      View Hospital Doctors
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
