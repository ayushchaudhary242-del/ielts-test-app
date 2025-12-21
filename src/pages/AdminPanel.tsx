import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, UserPlus, Trash2, Shield, Mail, Clock, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
}

interface WhitelistEntry {
  id: string;
  email: string;
  created_at: string;
  used_at: string | null;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'whitelist'>('users');

  useEffect(() => {
    // Check if accessed via password from Auth page
    const adminAccess = sessionStorage.getItem('adminAccess');
    if (adminAccess !== 'granted') {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [navigate]);

  const getAdminPassword = () => sessionStorage.getItem('adminPassword') || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-whitelist', {
        body: { action: 'list', password: getAdminPassword() }
      });

      if (error) throw error;
      
      setProfiles(data.profiles || []);
      setWhitelist(data.whitelist || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWhitelist = async () => {
    if (!newEmail.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-whitelist', {
        body: { action: 'add', password: getAdminPassword(), email: newEmail.trim() }
      });

      if (error) throw error;
      
      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        });
        return;
      }

      toast({ title: 'Success', description: 'Email added to whitelist.' });
      setNewEmail('');
      fetchData();
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add email. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const removeFromWhitelist = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-whitelist', {
        body: { action: 'remove', password: getAdminPassword(), id }
      });

      if (error) throw error;
      
      toast({ title: 'Removed', description: 'Email removed from whitelist.' });
      fetchData();
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove email. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAccess');
    sessionStorage.removeItem('adminPassword');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-header text-header-foreground flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="p-2 hover:bg-header/80 rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-header-foreground hover:bg-header/80">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            <Users className="w-4 h-4" />
            Users ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('whitelist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'whitelist' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            <Mail className="w-4 h-4" />
            Whitelist ({whitelist.length})
          </button>
        </div>

        {activeTab === 'whitelist' && (
          <>
            {/* Add to Whitelist */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Email to Whitelist
              </h3>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addToWhitelist()}
                  className="flex-1"
                />
                <Button onClick={addToWhitelist} className="bg-accent text-accent-foreground hover:opacity-90">
                  Add
                </Button>
              </div>
            </div>

            {/* Whitelist Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-secondary text-sm font-semibold text-muted-foreground">
                <div>Email</div>
                <div>Added</div>
                <div>Actions</div>
              </div>
              {whitelist.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No emails in whitelist. Add emails to allow signups.
                </div>
              ) : (
                whitelist.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-t border-border items-center">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {entry.email}
                      {entry.used_at && (
                        <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">Used</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWhitelist(entry.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-secondary text-sm font-semibold text-muted-foreground">
              <div>Email</div>
              <div>Joined</div>
              <div>Last Login</div>
            </div>
            {profiles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No users registered yet.
              </div>
            ) : (
              profiles.map((profile) => (
                <div key={profile.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-t border-border items-center">
                  <div className="font-medium text-foreground">{profile.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(profile.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {profile.last_login 
                      ? format(new Date(profile.last_login), 'MMM d, h:mm a')
                      : 'Never'
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
