import './ProfileCard.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../utils/api';

export default function ProfileCard() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    address: "",
    position: "",
    company: "",
    salary: 0,
    role: "employee",
    profilePic: "",
    department: "",
    qualification: "",
  dateOfJoining: "",
  dateOfBirth: "",
    linkedin: "",
    github: "",
    rolesAndResponsibility: [],
    skills: [],
    bankDetails: {
      bankingName: "",
      bankAccountNumber: "",
      ifscCode: "",
      upiId: ""
    }
  });

  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
  const [previewSrc, setPreviewSrc] = useState(null);

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(API_ENDPOINTS.getProfile, {
          headers: { Authorization: `Bearer ${token}` }
        }); // Adjust endpoint as needed

        // Normalize response and merge with defaults to avoid undefined nested fields
        const data = response.data || {};
        const normalized = {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          bloodGroup: data.bloodGroup || "",
          address: data.address || "",
          position: data.position || "",
          company: data.company || "",
          salary: data.salary ?? 0,
          role: data.role || "employee",
          profilePic: data.profilePic || "",
          department: data.department || "",
          qualification: data.qualification || "",
          dateOfJoining: data.dateOfJoining || "",
          dateOfBirth: data.dateOfBirth || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          rolesAndResponsibility: Array.isArray(data.rolesAndResponsibility) ? data.rolesAndResponsibility : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          bankDetails: {
            bankingName: (data.bankDetails && data.bankDetails.bankingName) || "",
            bankAccountNumber: (data.bankDetails && data.bankDetails.bankAccountNumber) || "",
            ifscCode: (data.bankDetails && data.bankDetails.ifscCode) || "",
            upiId: (data.bankDetails && data.bankDetails.upiId) || ""
          }
        };

  setProfile(normalized);
  setOriginalProfile(normalized);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Cleanup preview object URL on unmount
  useEffect(() => {
    return () => {
      if (previewSrc) {
        try { URL.revokeObjectURL(previewSrc); } catch (e) { /* ignore */ }
      }
    };
  }, [previewSrc]);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setProfile(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...profile[field]];
    newArray[index] = value;
    setProfile(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field) => {
    setProfile(prev => ({
      ...prev,
      [field]: [...prev[field], "New Item"]
    }));
  };

  const removeArrayItem = (field, index) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const toggleEdit = (section) => {
    setEditing(editing === section ? null : section);
  };

  const saveChanges = async () => {
    const token = localStorage.getItem('token');
    try {
      // Ensure salary is sent as a number
      const payload = {
        ...profile,
        salary: profile.salary === '' || profile.salary === null ? 0 : Number(profile.salary)
      };
      console.log('Saving profile with payload:', payload);
      await axios.put(API_ENDPOINTS.updateProfile, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(payload);
      setOriginalProfile(payload);
      setIsEditingAll(false);
      // Small success feedback
      try {
        toast.success('Profile updated: Your profile was updated successfully');
      } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error updating profile:', error);
  try { toast.error('Update failed: Failed to update profile. See console for details.'); } catch (e) { /* ignore */ }
    }
  };

  const cancelAllEdits = () => {
    if (originalProfile) setProfile(originalProfile);
    setPreviewSrc(null);
    setIsEditingAll(false);
  };

  const removeProfilePic = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(API_ENDPOINTS.updateProfile, { profilePic: '' }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(prev => ({ ...prev, profilePic: '' }));
      setPreviewSrc(null);
      try { toast.success('Removed: Profile picture removed'); } catch (e) {}
    } catch (err) {
      console.error('Failed to remove profile pic', err);
      try { toast.error('Remove failed: Could not remove profile picture'); } catch (e) {}
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-toolbar">
        {!isEditingAll ? (
          <button className="edit-btn main-edit" onClick={() => setIsEditingAll(true)}>Edit Profile</button>
        ) : (
          <div className="toolbar-actions">
            <button className="save-btn main-save" onClick={saveChanges}>Save All Changes</button>
            <button className="edit-btn main-cancel" onClick={cancelAllEdits}>Cancel</button>
          </div>
        )}
      </div>
      <div className="profile-content">
        {/* Left Column */}
        <div className="column">
          {/* Basic Information Card */}
          <div className="card">
            <div className="card-header">
              <h3>Basic Information</h3>
            </div>
            <div className="basic-info">
              <div className="left">
                <img
                  src={previewSrc || profile.profilePic || "/default-avatar.png"}
                  alt="Profile"
                  className="avatar"
                />
                {(editing === 'basicInfo' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <h2>{profile.name}</h2>
                )}
                {(editing === 'basicInfo' || isEditingAll) && (
                  <div className="info-item upload-block">
                    <label className="upload-label">Change Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={async (e) => {
                        if (uploading) return;
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;

                        // create local preview
                        let localUrl = null;
                        try {
                          localUrl = URL.createObjectURL(file);
                          setPreviewSrc(localUrl);
                        } catch (err) {
                          console.error('Could not create preview', err);
                        }

                        // Client-side guards
                        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                          try { toast.warning('Invalid file type: Only JPG and PNG are allowed.'); } catch (e) {}
                          if (localUrl) URL.revokeObjectURL(localUrl);
                          setPreviewSrc(null);
                          return;
                        }
                        if (file.size > MAX_FILE_SIZE) {
                          try { toast.warning('File too large: Maximum allowed size is 2 MB.'); } catch (e) {}
                          if (localUrl) URL.revokeObjectURL(localUrl);
                          setPreviewSrc(null);
                          return;
                        }

                        const token = localStorage.getItem('token');
                        const form = new FormData();
                        form.append('profilePic', file);
                        setUploading(true);
                        try {
                          const res = await axios.post(API_ENDPOINTS.uploadProfile, form, {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              'Content-Type': 'multipart/form-data'
                            }
                          });
                          // backend returns updated user
                          const updated = res.data;
                          setProfile(prev => ({ ...prev, profilePic: updated.profilePic || '' }));
                          // clear preview
                          if (localUrl) URL.revokeObjectURL(localUrl);
                          setPreviewSrc(null);
                        } catch (err) {
                          console.error('Upload failed', err);
                          try { toast.error('Upload failed: Image upload failed'); } catch (e) {}
                          // keep preview so user can retry or choose another
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                    {uploading && <div className="small">Uploading...</div>}
                    {isEditingAll && profile.profilePic && (
                      <button className="remove-pic-btn" onClick={removeProfilePic} type="button">Remove</button>
                    )}
                  </div>
                )}
                
                <div className="info-item">
                   Email: 
                  {(editing === 'basicInfo' || isEditingAll) ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.email}</span>
                  )}
                </div>
                 <div className="info-item">
                 Date of Birth: 
                {(editing === 'company' || isEditingAll) ? (
                  <input
                    type="date"
                    value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}</span>
                )}
              </div>
                <div className="info-item">
                   Phone: 
                  {(editing === 'basicInfo' || isEditingAll) ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.phone}</span>
                  )}
                </div>
                <div className="info-item">
                   Address: 
                  {(editing === 'basicInfo' || isEditingAll) ? (
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.address}</span>
                  )}
                </div>
                
                <div className="info-item">
                   Blood Group: 
                  {(editing === 'basicInfo' || isEditingAll) ? (
                    <input
                      type="text"
                      value={profile.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.bloodGroup}</span>
                  )}
                </div>
              </div>
            </div>
            {/* global save used instead of per-card save */}
          </div>

          {/* Social Links Card */}
          <div className="card">
            <div className="card-header">
              <h3>Social Links</h3>
            </div>
            <div className="education-info">
              <div className="info-row">
                 LinkedIn:
                {(editing === 'social' || isEditingAll) ? (
                  <input
                    type="url"
                    value={profile.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="edit-input"
                    placeholder="https://linkedin.com/in/username"
                  />
                ) : profile.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin}</a>
                ) : (
                  <span>Not set</span>
                )}
              </div>
              <div className="info-row">
                 GitHub:
                {(editing === 'social' || isEditingAll) ? (
                  <input
                    type="url"
                    value={profile.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    className="edit-input"
                    placeholder="https://github.com/username"
                  />
                ) : profile.github ? (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer">{profile.github}</a>
                ) : (
                  <span>Not set</span>
                )}
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="card">
            <div className="card-header">
              <h3>Education & Qualification</h3>
            </div>
            <div className="education-info">
              <div className="info-row">
                 Qualification: 
                {(editing === 'education' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.qualification}</span>
                )}
              </div>
             
            </div>
          </div>

          {/* Skills Card */}
          <div className="card">
            <div className="card-header">
              <h3>Skills</h3>
            </div>
            <div className="skills-info">
              {profile.skills.map((skill, index) => (
                <div key={index} className="skill-item-container">
                  {(editing === 'skills' || isEditingAll) ? (
                    <>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                        className="edit-input skill-input"
                      />
                      <button 
                        className="remove-skill-btn"
                        onClick={() => removeArrayItem('skills', index)}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="skill-item">{skill}</div>
                  )}
                </div>
              ))}
              {(editing === 'skills' || isEditingAll) && (
                <button className="add-skill-btn" onClick={() => addArrayItem('skills')}>
                  + Add Skill
                </button>
              )}
            </div>
          </div>

          {/* Roles & Responsibilities Card */}
          <div className="card">
            <div className="card-header">
              <h3>Roles & Responsibilities</h3>
            </div>
            <div className="roles-info">
              {profile.rolesAndResponsibility.map((role, index) => (
                <div key={index} className="role-item-container">
                  {(editing === 'rolesAndResponsibility' || isEditingAll) ? (
                    <>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => handleArrayChange('rolesAndResponsibility', index, e.target.value)}
                        className="edit-input role-input"
                      />
                      <button 
                        className="remove-role-btn"
                        onClick={() => removeArrayItem('rolesAndResponsibility', index)}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="role-item">• {role}</div>
                  )}
                </div>
              ))}
              {(editing === 'rolesAndResponsibility' || isEditingAll) && (
                <button className="add-role-btn" onClick={() => addArrayItem('rolesAndResponsibility')}>
                  + Add Responsibility
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="column">
          {/* Personal Details Card */}
          {/* <div className="card">
            <div className="card-header">
              <h3>Personal Details</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('personalDetails')}
              >
                {editing === 'personalDetails' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="personal-details">
              <div className="info-row">
                 Blood Group: 
                {editing === 'personalDetails' ? (
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <span>{profile.bloodGroup}</span>
                )}
              </div>
              <div className="info-row">
                 Role: 
                {editing === 'personalDetails' ? (
                  <select
                    value={profile.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="edit-select"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span>{profile.role}</span>
                )}
              </div>
            </div>
            {editing === 'personalDetails' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div> */}

          {/* Banking Details Card */}
          <div className="card">
            <div className="card-header">
              <h3>Banking Details</h3>
            </div>
            <div className="banking-info">
              <div className="info-row">
                 Bank Name: 
                {(editing === 'bankDetails' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.bankDetails.bankingName}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'bankingName', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.bankingName}</span>
                )}
              </div>
              <div className="info-row">
                 Account Number: 
                {(editing === 'bankDetails' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.bankDetails.bankAccountNumber}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'bankAccountNumber', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.bankAccountNumber}</span>
                )}
              </div>
              <div className="info-row">
                 IFSC Code: 
                {(editing === 'bankDetails' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.bankDetails.ifscCode}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'ifscCode', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.ifscCode}</span>
                )}
              </div>
              <div className="info-row">
                 UPI ID: 
                {(editing === 'bankDetails' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.bankDetails.upiId}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'upiId', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.upiId}</span>
                )}
              </div>
            </div>
          </div>

          {/* Company & Position Card */}
          <div className="card">
            <div className="card-header">
              <h3>Company & Position</h3>
            </div>
            <div className="company-info">
              <div className="info-row">
                 Position: 
                {(editing === 'company' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.position}</span>
                )}
              </div>
              <div className="info-row">
                 Company: 
                {(editing === 'company' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.company}</span>
                )}
              </div>
              <div className="info-row">
                 Department: 
                {(editing === 'company' || isEditingAll) ? (
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.department}</span>
                )}
              </div>
              <div className="info-row">
                 Salary: 
                {(editing === 'company' || isEditingAll) ? (
                  <input
                    type="number"
                    value={profile.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>₹{Number(profile.salary).toLocaleString()}/year</span>
                )}
              </div>
              <div className="info-row">
                 Date of Joining: 
                {(editing === 'company' || isEditingAll) ? (
                  <input
                    type="date"
                    value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'Not set'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}