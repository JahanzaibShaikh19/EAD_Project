import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEmployee, useUpdateMyProfile, useUpdateMyPhoto } from '../../api/employeeApi';
import { Camera, Save, User, MapPin, Phone, Heart } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import { INPUT_CLASS } from '../../utils/constants';

export default function MyProfile() {
  const { user } = useAuth();
  const { data: employeeData, isLoading } = useEmployee(user?.employee_id);
  const employee = employeeData?.data;

  const updateProfile = useUpdateMyProfile();
  const updatePhoto = useUpdateMyPhoto();

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        phone: employee.phone || '',
        address: employee.address || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        emergency_contact_relation: employee.emergency_contact_relation || '',
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updatePhoto.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-content fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading" style={{ color: 'var(--color-text-primary)' }}>
          My Profile
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your personal information and emergency contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Photo & Read-only Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center relative">
            <div className="relative inline-block">
              {employee?.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm mx-auto"
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-sm mx-auto"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {getInitials(employee?.first_name, employee?.last_name)}
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow cursor-pointer hover:bg-gray-50 transition-colors border">
                <Camera size={16} style={{ color: 'var(--color-text-primary)' }} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <h2 className="mt-4 text-xl font-bold font-heading">{employee?.first_name} {employee?.last_name}</h2>
            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              {employee?.position_title || 'No Position'}
            </p>

            <div className="mt-6 pt-6 border-t text-left space-y-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Department</p>
                <p className="font-medium">{employee?.department_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Employee Code</p>
                <p className="font-medium">{employee?.employee_code}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Status</p>
                <span className={`badge-base badge-success capitalize mt-1`}>{employee?.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Form */}
        <div className="md:col-span-2">
          <form className="card space-y-6" onSubmit={handleSubmit}>
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <Phone size={18} /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email (Read Only)</label>
                  <input type="email" value={employee?.email || ''} readOnly className={INPUT_CLASS} style={{ background: 'var(--color-bg)', opacity: 0.7, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={INPUT_CLASS} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className={`${INPUT_CLASS} resize-none`} placeholder="Full residential address" />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <Heart size={18} /> Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Contact Name</label>
                  <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className={INPUT_CLASS} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Contact Phone</label>
                  <input type="text" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className={INPUT_CLASS} placeholder="+1 (555) 111-2222" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Relationship</label>
                  <input type="text" name="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange} className={INPUT_CLASS} placeholder="Spouse, Parent, etc." />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'} <Save size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
