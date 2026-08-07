import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlay, FiSquare, FiRefreshCw, FiWatch } from 'react-icons/fi';

const PromoTimer = ({
  titleText = 'Limited Time Promo!',
  variant = 'default',
}) => {
  const [inputMinutes, setInputMinutes] = useState(1);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isRunning && time <= 0) {
      handleTimeEnd();
    }
  }, [time, isRunning]);

  const handleTimeEnd = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    audioRef.current?.play();
    toast.info("Time's up! Your promo timer has ended.");
  };

  const startTimer = () => {
    const seconds = parseInt(inputMinutes, 10) * 60;
    if (Number.isNaN(seconds) || seconds <= 0) return;

    setTime(seconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTime((prev) => prev - 1);
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

  if (variant === 'taskManager') {
    return (
      <div className="tm-promo">
        <audio ref={audioRef} src="/test.mp3" preload="auto" />
        <div className="tm-promo-left">
          <FiWatch />
          {isRunning ? `Promo ends in ${formatTime(time)}` : titleText}
        </div>
        <div className="tm-promo-controls">
          <input
            type="number"
            min="1"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            disabled={isRunning}
          />
          <span className="tm-mins">minutes</span>
          <button
            type="button"
            className="tm-promo-btn start"
            onClick={startTimer}
            disabled={isRunning}
          >
            <FiPlay /> Start
          </button>
          <button
            type="button"
            className="tm-promo-btn stop"
            onClick={stopTimer}
            disabled={!isRunning}
          >
            <FiSquare /> Stop
          </button>
          <button type="button" className="tm-promo-btn reset" onClick={resetTimer}>
            <FiRefreshCw /> Reset
          </button>
        </div>
        <div className="tm-promo-clock">{formatTime(time)}</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-100 via-rose-50 to-sky-100 text-center p-6 rounded-xl shadow-xl mt-6 space-y-4 border border-yellow-300">
      <audio ref={audioRef} src="/test.mp3" preload="auto" />
      <h2 className="text-xl font-bold text-indigo-700 animate-pulse">
        {isRunning ? `⏱ Promo ends in ${formatTime(time)}` : titleText}
      </h2>
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
          type="button"
          onClick={startTimer}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Start
        </button>
        <button
          type="button"
          onClick={stopTimer}
          disabled={!isRunning}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={resetTimer}
          className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
      <div className="text-4xl font-bold text-red-600 tracking-wide transition-all duration-300 ease-in-out">
        {formatTime(time)}
      </div>
    </div>
  );
};

export default PromoTimer;
