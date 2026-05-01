import { useEffect, useState } from 'react';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiGet, apiPut } from '../../services/api.js';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [preview, setPreview] = useState(user?.profilePicture || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiGet('/api/auth/me')
      .then((response) => {
        if (!mounted) return;
        const nextUser = response?.data?.user;
        if (!nextUser) return;
        updateUser(nextUser);
        setFullName(nextUser.fullName || '');
        setDesignation(nextUser.designation || '');
        setPreview(nextUser.profilePicture || '');
      })
      .catch(() => {
        // Keep local user state if /me fails.
      });
    return () => {
      mounted = false;
    };
  }, []);

  const onFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      setSuccess('');
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Please choose image up to 1MB for profile picture.');
      setSuccess('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result || ''));
      setError('');
    };
    reader.onerror = () => {
      setError('Unable to read image. Please try a different file.');
      setSuccess('');
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiPut('/api/auth/profile', {
        fullName: fullName.trim(),
        designation: designation.trim(),
        profilePicture: preview || null
      });
      const nextUser = response?.data?.user;
      if (nextUser) updateUser(nextUser);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <Card
        title="User Profile"
        action={
          <button className="btn" type="button" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        }
      >
        {error ? <div className="alert">{error}</div> : null}
        {success ? <div className="helper">{success}</div> : null}
        <div className="form-group">
          <label>Profile Picture</label>
          <div className="profile-pic-row">
            <div className="avatar profile-avatar">
              {preview ? <img src={preview} alt="Profile" /> : null}
            </div>
            <input type="file" accept="image/*" onChange={onFileSelect} />
          </div>
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input value={user?.email || ''} disabled />
        </div>
        <div className="form-group">
          <label>Designation</label>
          <input value={designation} onChange={(event) => setDesignation(event.target.value)} />
        </div>
      </Card>
    </div>
  );
}
