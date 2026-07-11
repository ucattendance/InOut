// Full Attendance Component Updated to Match Provided UI

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FiCamera, FiCheckCircle, FiClock, FiMapPin, FiRefreshCw, FiUser, FiChevronRight
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINTS } from '../utils/api';
import { appendAttendanceImage } from '../utils/attendanceImage';
import { toast } from 'react-toastify';

function Attendance() {
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [type, setType] = useState('check-in');
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [userName, setUserName] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.name || 'User');
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.getLastAttendanceGlobal, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setType(res.data.type === 'check-in' ? 'check-out' : 'check-in');

        const myAttendance = await axios.get(API_ENDPOINTS.getMyAttendance, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAttendanceHistory(myAttendance.data.slice(0, 5));
      } catch (err) {
        toast.error('Fetch Error: Could not load your attendance data.');
      }
    };

    fetchData();

    const startCamera = async () => {
      try {
        setIsCapturing(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        toast.error('Camera Access Denied: Please enable your camera and refresh the page.');
        setIsCapturing(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const compressImage = async (file, maxSizeKB = 40) => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = event => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width, height = img.height;
          const MAX_WIDTH = 800, MAX_HEIGHT = 600;
          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.9;
          const checkSize = () => {
            canvas.toBlob(blob => {
              if (!blob) return resolve(null);
              const sizeKB = blob.size / 1024;
              if (sizeKB <= maxSizeKB || quality <= 0.1) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else {
                quality -= 0.1;
                canvas.toBlob(checkSize, 'image/jpeg', quality);
              }
            }, 'image/jpeg', quality);
          };
          checkSize();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const captureImage = () =>
    new Promise((resolve) => {
      try {
        if (!videoRef.current) {
          resolve(null);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], 'attendance.jpg', { type: 'image/jpeg' });
          const compressed = await compressImage(file);
          resolve(compressed || null);
        }, 'image/jpeg', 0.9);
      } catch {
        resolve(null);
      }
    });

  const handleSubmit = async (photoFile) => {
    const fileToSend = photoFile || image;
    if (!fileToSend) {
      toast.warning('No image captured!');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
      setLocation(coords);
      const formData = new FormData();
      formData.append('type', type);
      formData.append('location', coords);
      appendAttendanceImage(formData, fileToSend);
      try {
        await axios.post(API_ENDPOINTS.postAttendance, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        toast.success(`${type === 'check-in' ? 'Checked In' : 'Checked Out'} successfully!`);
        setImage(null);
      } catch (err) {
        toast.error('Failed to Submit');
      } finally {
        setIsLoading(false);
      }
    }, () => {
      toast.error('Location Error: Please enable GPS to proceed.');
      setIsLoading(false);
    });
  };

  const captureAndSubmit = async () => {
    const captured = await captureImage();
    if (!captured) {
      toast.error('Image Capture Failed');
      return;
    }
    setImage(captured);
    await handleSubmit(captured);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 max-w-md mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <img src="/profile.jpg" alt="avatar" className="w-12 h-12 rounded-full" />
        <div>
          <h2 className="text-lg font-bold">{userName}</h2>
          <p className="text-sm text-gray-500">Lead UI/UX Designer</p>
        </div>
        <div className="ml-auto">🔔</div>
      </div>

      <div className="flex justify-between items-center mb-4">
        {[6, 7, 8, 9, 10].map((d, i) => (
          <div key={i} className={`text-center px-2 py-1 rounded ${d === 9 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            <div className="text-sm font-bold">0{d}</div>
            <div className="text-xs">{['Thu', 'Fri', 'Sat', 'Sun', 'Mon'][i]}</div>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-md mb-2">Today Attendance</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Check In</p>
          <h4 className="text-xl font-bold">10:20 am</h4>
          <p className="text-xs text-green-600">On Time</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Check Out</p>
          <h4 className="text-xl font-bold">07:00 pm</h4>
          <p className="text-xs text-blue-600">Go Home</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Break Time</p>
          <h4 className="text-xl font-bold">00:30 min</h4>
          <p className="text-xs">Avg Time 30 min</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Days</p>
          <h4 className="text-xl font-bold">28</h4>
          <p className="text-xs">Working Days</p>
        </div>
      </div>

      <h3 className="font-semibold text-md mb-2">Your Activity</h3>
      {attendanceHistory.map((item, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-lg mb-2">
          <p className="text-sm capitalize">{item.type}</p>
          <div className="flex justify-between items-center">
            <span className="font-bold">{new Date(item.timestamp).toLocaleTimeString()}</span>
            <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      ))}

      <div
        className="flex justify-between items-center bg-red-500 text-white p-4 rounded-full shadow-md cursor-pointer mt-4"
        onClick={captureAndSubmit}
      >
        <span className="text-sm">Swipe to {type === 'check-in' ? 'Check In' : 'Check Out'}</span>
        <FiChevronRight />
      </div>

      {isCapturing && (
        <video ref={videoRef} autoPlay playsInline muted className="mt-4 rounded-lg w-full" />
      )}
    </div>
  );
}

export default Attendance;
