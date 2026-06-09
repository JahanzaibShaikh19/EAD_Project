import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';

export default function Settings() {
  return (
    <PageWrapper>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your application settings and preferences." 
      />
      <div className="card max-w-4xl">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>General Settings</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          General settings configuration is coming soon.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Email Notifications</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Receive emails for important updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" style={{ '--tw-bg-opacity': 1, backgroundColor: 'var(--color-primary)' }}></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Weekly Digest</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Receive a weekly summary of activities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" style={{ '--tw-bg-opacity': 1, backgroundColor: 'var(--color-primary)' }}></div>
            </label>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
