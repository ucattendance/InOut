/** Truthy flags from API (boolean, "true", 1). */
export const isApiTrue = (value) =>
  value === true || value === 'true' || value === 1 || value === '1';

export const ATTENDANCE_LOCKED_MESSAGE =
  'Your account is locked because your profile is incomplete. Please contact the administrator.';

export const PROFILE_INCOMPLETE_ENTRY_MESSAGE =
  'Your profile is incomplete. Please complete your profile before checking in.';

const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

/**
 * Backend may put profileIncomplete on the root or under data/result/meta.
 * Returns the object that owns the flag, or null.
 */
export const getProfileIncompletePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  const candidates = [
    payload,
    payload.data,
    payload.result,
    payload.meta,
    payload.warning,
    payload.warnings,
    payload.profile,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    if (
      isApiTrue(candidate.profileIncomplete) ||
      isApiTrue(candidate.profile_incomplete) ||
      isApiTrue(candidate.isProfileIncomplete)
    ) {
      return candidate;
    }
    if (
      candidate.profileComplete === false ||
      candidate.profileComplete === 'false'
    ) {
      return candidate;
    }
    if (Array.isArray(candidate.missingFields) && candidate.missingFields.length > 0) {
      return candidate;
    }
  }

  return null;
};

/**
 * Fallback when /users/me does not include profileIncomplete (flag is often
 * only returned on Check-In). Infer from fields the profile/registration forms use.
 */
export const inferMissingProfileFields = (user) => {
  if (!user || typeof user !== 'object') return [];
  const bank = user.bankDetails || {};
  const missing = [];

  if (isEmpty(user.phone)) missing.push('phone');
  if (isEmpty(user.dateOfBirth)) missing.push('dateOfBirth');
  if (isEmpty(user.bloodGroup)) missing.push('bloodGroup');
  if (isEmpty(user.address) && isEmpty(user.branch) && isEmpty(bank.officeBranch)) {
    missing.push('address');
  }
  if (isEmpty(user.profilePic)) missing.push('profilePic');
  if (isEmpty(bank.bankingName)) missing.push('bankingName');
  if (isEmpty(bank.bankAccountNumber) && isEmpty(bank.accountNumber)) {
    missing.push('bankAccountNumber');
  }
  if (isEmpty(bank.ifscCode)) missing.push('ifscCode');

  return missing;
};

export const isProfileIncompleteUser = (user) => {
  if (!user || typeof user !== 'object') return false;

  // Explicit complete wins.
  if (isApiTrue(user.profileComplete)) return false;
  if (user.profileIncomplete === false || user.profile_incomplete === false) {
    return false;
  }

  if (getProfileIncompletePayload(user)) return true;
  if (isApiTrue(user.profileIncomplete) || isApiTrue(user.isProfileIncomplete)) {
    return true;
  }
  if (user.profileComplete === false || user.profileComplete === 'false') {
    return true;
  }
  if (Array.isArray(user.missingFields) && user.missingFields.length > 0) {
    return true;
  }

  // /users/me often omits the boolean; detect from empty required profile fields.
  return inferMissingProfileFields(user).length > 0;
};

export const getAttendanceLockError = (error) => {
  const status = error?.response?.status;
  const body = error?.response?.data;
  const code =
    body?.code ||
    body?.error?.code ||
    body?.data?.code ||
    body?.errorCode;

  if (status === 403 && code === 'ATTENDANCE_LOCKED') {
    return {
      locked: true,
      message:
        body?.message ||
        body?.error?.message ||
        ATTENDANCE_LOCKED_MESSAGE,
    };
  }

  return { locked: false };
};

export const isAttendanceLockedUser = (user) =>
  isApiTrue(user?.attendanceLocked) || isApiTrue(user?.isAttendanceLocked);
