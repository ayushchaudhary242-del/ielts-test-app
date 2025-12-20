import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, UserPlus, Trash2, Shield, Mail, Clock } from 'lucide-react';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'whitelist'>('users');

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (error || !data) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    fetchData();
  };

  const fetchData = async () => {
    const [profilesRes, whitelistRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('email_whitelist').select('*').order('created_at', { ascending: false })
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data);
    if (whitelistRes.data) setWhitelist(whitelistRes.data);
  };

  const addToWhitelist = async () => {
    if (!newEmail.trim()) return;

    const emailLower = newEmail.toLowerCase().trim();
    
    const { error } = await supabase
      .from('email_whitelist')
      .insert({ email: emailLower, added_by: user?.id });

    if (error) {
      toast({
        title: 'Error',
        description: error.message.includes('duplicate') 
          ? 'This email is already whitelisted.' 
          : error.message,
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Success', description: 'Email added to whitelist.' });
      setNewEmail('');
      fetchData();
    }
  };

  const removeFromWhitelist = async (id: string) => {
    const { error } = await supabase.from('email_whitelist').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Removed', description: 'Email removed from whitelist.' });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-header text-header-foreground flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-header/80 rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-bold">Admin Panel</span>
        </div>
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
                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded">Used</span>
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
