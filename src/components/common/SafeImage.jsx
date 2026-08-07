import React, { useEffect, useState } from 'react';
import { markAttendanceImageFailed } from '../../utils/attendanceImage';

const failedUrls = new Set();

/**
 * Image that skips known-bad URLs and hides itself on load error (avoids repeat 404 noise).
 */
const SafeImage = ({ src, alt = '', style, className, onClick }) => {
  const nextUrl = src && !failedUrls.has(src) ? src : '';
  const [url, setUrl] = useState(nextUrl);

  // Keep displayed image in sync when parent passes a new src (row reuse / refresh).
  useEffect(() => {
    setUrl(src && !failedUrls.has(src) ? src : '');
  }, [src]);

  if (!url) return null;

  return (
    <img
      src={url}
      alt={alt}
      style={style}
      className={className}
      onClick={onClick}
      loading="lazy"
      decoding="async"
      onError={() => {
        failedUrls.add(url);
        markAttendanceImageFailed(url);
        setUrl('');
      }}
    />
  );
};

export default SafeImage;
