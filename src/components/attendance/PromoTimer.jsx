// src/components/attendance/PromoTimer.js
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const PromoTimer = ({ titleText = "🎯 Limited Time Promo!" }) => {
  const [inputMinutes, setInputMinutes] = useState(1);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Countdown logic
  useEffect(() => {
    if (isRunning) {
      if (time <= 0) {
        handleTimeEnd();
      }
    }
  }, [time, isRunning]);

  const handleTimeEnd = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    audioRef.current?.play();
    toast.info("⏰ Time's up! Your promo timer has ended.");
  };

  const startTimer = () => {
    const seconds = parseInt(inputMinutes) * 60;
    if (isNaN(seconds) || seconds <= 0) return;

    setTime(seconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTime(prev => prev - 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (t) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-yellow-100 via-rose-50 to-sky-100 text-center p-6 rounded-xl shadow-xl mt-6 space-y-4 border border-yellow-300">
      <audio ref={audioRef} src="/test.mp3" preload="auto" />

      {/* Dynamic title content */}
      <h2 className="text-xl font-bold text-indigo-700 animate-pulse">
        {isRunning ? `⏱ Promo ends in ${formatTime(time)}` : titleText}
      </h2>

      {/* Control Inputs */}
      <div className="flex justify-center gap-2 items-center flex-wrap">
        <input
          type="number"
          min="1"
          value={inputMinutes}
          onChange={(e) => setInputMinutes(e.target.value)}
          disabled={isRunning}
          className="border border-gray-400 rounded px-3 py-1 w-24 text-center shadow-sm"
        />
        <span className="text-sm text-gray-700">minutes</span>
        <button
          onClick={startTimer}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={stopTimer}
          disabled={!isRunning}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop
        </button>
        <button
          onClick={resetTimer}
          className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {/* Live countdown display */}
      <div className="text-4xl font-bold text-red-600 tracking-wide transition-all duration-300 ease-in-out">
        {formatTime(time)}
      </div>
    </div>
  );
};

export default PromoTimer;
