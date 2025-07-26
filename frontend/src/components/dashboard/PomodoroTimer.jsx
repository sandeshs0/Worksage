import {
  Bell,
  Maximize,
  Minimize,
  Pause,
  Play,
  RefreshCw,
  Settings,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PomodoroTimer = () => {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState("work"); // 'work', 'shortBreak', 'longBreak'
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs
  const pomodoroRef = useRef(null);
  const startSoundRef = useRef(null);
  const endSoundRef = useRef(null);
  const clickSoundRef = useRef(null);

  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25, // minutes
    shortBreak: 5, // minutes
    longBreak: 15, // minutes
    longBreakInterval: 4, // number of work sessions before a long break
  });

  // Timer display format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Start or pause timer
  const toggleTimer = () => {
    if (!isActive && soundEnabled) {
      startSoundRef.current.play();
    }
    setIsActive(!isActive);
  };

  // Reset timer to initial state based on session type
  const resetTimer = () => {
    setIsActive(false);
    if (sessionType === "work") {
      setTimeLeft(settings.workDuration * 60);
    } else if (sessionType === "shortBreak") {
      setTimeLeft(settings.shortBreak * 60);
    } else {
      setTimeLeft(settings.longBreak * 60);
    }
    if (soundEnabled) {
      clickSoundRef.current.play();
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (pomodoroRef.current.requestFullscreen) {
        pomodoroRef.current.requestFullscreen();
      } else if (pomodoroRef.current.mozRequestFullScreen) {
        pomodoroRef.current.mozRequestFullScreen();
      } else if (pomodoroRef.current.webkitRequestFullscreen) {
        pomodoroRef.current.webkitRequestFullscreen();
      } else if (pomodoroRef.current.msRequestFullscreen) {
        pomodoroRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }

    if (soundEnabled) {
      clickSoundRef.current.play();
    }
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    clickSoundRef.current.play(); // Play sound when toggling sound option itself
  };

  // Skip to next session
  const skipSession = () => {
    let nextSessionType;
    let nextTimeLeft;

    if (sessionType === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      // Check if it's time for a long break
      if (newCompletedSessions % settings.longBreakInterval === 0) {
        nextSessionType = "longBreak";
        nextTimeLeft = settings.longBreak * 60;
      } else {
        nextSessionType = "shortBreak";
        nextTimeLeft = settings.shortBreak * 60;
      }
    } else {
      // If we're in a break, next session is work
      nextSessionType = "work";
      nextTimeLeft = settings.workDuration * 60;
    }

    setSessionType(nextSessionType);
    setTimeLeft(nextTimeLeft);
    setIsActive(false); // Pause the timer when skipping

    if (soundEnabled) {
      clickSoundRef.current.play();
    }
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Update settings
  const updateSettings = (settingName, value) => {
    const newSettings = { ...settings, [settingName]: parseInt(value, 10) };
    setSettings(newSettings);

    // Update the current timer if the changed setting affects the current session
    if (settingName === "workDuration" && sessionType === "work") {
      setTimeLeft(parseInt(value, 10) * 60);
    } else if (settingName === "shortBreak" && sessionType === "shortBreak") {
      setTimeLeft(parseInt(value, 10) * 60);
    } else if (settingName === "longBreak" && sessionType === "longBreak") {
      setTimeLeft(parseInt(value, 10) * 60);
    }
  };

  // Show notification when timer ends
  const showNotification = (title, message) => {
    // Play sound when timer ends
    if (soundEnabled) {
      endSoundRef.current.play();
    }

    // Show browser notification
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body: message });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body: message });
          }
        });
      }
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer has completed
      const nextSessionMessage =
        sessionType === "work"
          ? "Work session completed! Time for a break."
          : "Break time is over! Ready to get back to work?";

      showNotification("Pomodoro Timer", nextSessionMessage);

      // Auto-transition to the next session type
      skipSession();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Also listen for fullscreenchange event
    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [isFullscreen]);

  // Get background color based on session type
  const getBgColor = () => {
    switch (sessionType) {
      case "work":
        return "bg-gradient-to-r from-[#18cb96]/10 to-[#18cb96]/20";
      case "shortBreak":
        return "bg-gradient-to-r from-[#18172a]/10 to-[#18172a]/15";
      case "longBreak":
        return "bg-gradient-to-r from-[#18cb96]/5 to-[#18172a]/10";
      default:
        return "bg-white";
    }
  };

  // Get text color based on session type
  const getTextColor = () => {
    switch (sessionType) {
      case "work":
        return "text-[#18cb96]";
      case "shortBreak":
        return "text-[#18172a]";
      case "longBreak":
        return "text-[#18172a]";
      default:
        return "text-gray-700";
    }
  };

  // Get border color based on session type
  const getBorderColor = () => {
    switch (sessionType) {
      case "work":
        return "border-[#18cb96]/30";
      case "shortBreak":
        return "border-[#18172a]/30";
      case "longBreak":
        return "border-[#18cb96]/20";
      default:
        return "border-gray-200";
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    let totalTime;
    if (sessionType === "work") {
      totalTime = settings.workDuration * 60;
    } else if (sessionType === "shortBreak") {
      totalTime = settings.shortBreak * 60;
    } else {
      totalTime = settings.longBreak * 60;
    }

    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <>
      <div
        ref={pomodoroRef}
        className={`p-6 rounded-lg shadow-sm ${getBgColor()} transition-all duration-300 ease-in-out ${
          isFullscreen
            ? "fixed inset-0 z-50 flex flex-col items-center justify-center"
            : ""
        }`}
      >
        {/* Audio elements */}
        <audio ref={startSoundRef} preload="auto">
          <source
            src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
            type="audio/ogg"
          />
        </audio>
        <audio ref={endSoundRef} preload="auto">
          <source
            src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
            type="audio/ogg"
          />
        </audio>
        <audio ref={clickSoundRef} preload="auto">
          <source
            src="https://actions.google.com/sounds/v1/ui/ui_tap_variant_01.ogg"
            type="audio/ogg"
          />
        </audio>

        <div className="flex justify-between items-center mb-4">
          <h2
            className={`font-semibold ${isFullscreen ? "text-2xl text-white" : "text-xl"}`}
          >
            Pomodoro Timer
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title={soundEnabled ? "Disable Sound" : "Enable Sound"}
            >
              {soundEnabled ? (
                <Volume2 size={20} className="text-gray-600" />
              ) : (
                <VolumeX size={20} className="text-gray-600" />
              )}
            </button>
            <button
              onClick={toggleSettings}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-[#18cb96]" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize size={20} className="text-gray-600" />
              ) : (
                <Maximize size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Session type tabs */}
        <div
          className={`flex space-x-2 mb-6 ${
            isFullscreen ? "max-w-md mx-auto w-full" : ""
          }`}
        >
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              sessionType === "work"
                ? "bg-white shadow-sm text-[#18cb96] border-b-2 border-[#18cb96]"
                : "bg-transparent text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => {
              setSessionType("work");
              setTimeLeft(settings.workDuration * 60);
              setIsActive(false);
              if (soundEnabled) clickSoundRef.current.play();
            }}
          >
            Work
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              sessionType === "shortBreak"
                ? "bg-white shadow-sm text-[#18172a] border-b-2 border-[#18172a]"
                : "bg-transparent text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => {
              setSessionType("shortBreak");
              setTimeLeft(settings.shortBreak * 60);
              setIsActive(false);
              if (soundEnabled) clickSoundRef.current.play();
            }}
          >
            Short Break
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              sessionType === "longBreak"
                ? "bg-white shadow-sm text-[#18172a] border-b-2 border-[#18172a]"
                : "bg-transparent text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => {
              setSessionType("longBreak");
              setTimeLeft(settings.longBreak * 60);
              setIsActive(false);
              if (soundEnabled) clickSoundRef.current.play();
            }}
          >
            Long Break
          </button>
        </div>

        {/* Timer display with improved progress circle */}
        <div
          className={`relative mx-auto rounded-full flex items-center justify-center mb-6 ${
            isFullscreen ? "w-96 h-96" : "w-64 h-64"
          }`}
        >
          {/* Background circle */}
          <div
            className={`absolute inset-0 rounded-full border-8 ${getBorderColor()} bg-white`}
          ></div>

          {/* Progress circle - Improved with gradient and animation */}
          <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
            <defs>
              <linearGradient
                id="gradient-work"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#18cb96" />
                <stop offset="100%" stopColor="#00556a" />
              </linearGradient>
              <linearGradient
                id="gradient-short"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#18172a" />
                <stop offset="100%" stopColor="#15203c" />
              </linearGradient>
              <linearGradient
                id="gradient-long"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#18cb96" />
                <stop offset="100%" stopColor="#18172a" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke={`url(#gradient-${
                sessionType === "work"
                  ? "work"
                  : sessionType === "shortBreak"
                  ? "short"
                  : "long"
              })`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${
                2 * Math.PI * 0.46 * (isFullscreen ? 96 : 64)
              }`}
              strokeDashoffset={`${
                2 *
                Math.PI *
                0.46 *
                (isFullscreen ? 96 : 64) *
                (1 - calculateProgress() / 100)
              }`}
              filter="url(#glow)"
              style={{
                transition: "stroke-dashoffset 1s linear",
                transformOrigin: "center",
              }}
            />
          </svg>

          <div className="text-center z-10">
            <div
              className={`${
                isFullscreen ? "text-8xl" : "text-5xl"
              } font-bold mb-3 ${getTextColor()}`}
            >
              {formatTime(timeLeft)}
            </div>
            <div
              className={`${
                isFullscreen ? "text-xl" : "text-sm"
              } text-gray-500 capitalize`}
            >
              {sessionType === "work"
                ? "Work Session"
                : sessionType === "shortBreak"
                ? "Short Break"
                : "Long Break"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          className={`flex justify-center space-x-4 mb-6 ${
            isFullscreen ? "mt-8" : ""
          }`}
        >
          <button
            onClick={toggleTimer}
            className={`${isFullscreen ? "p-6" : "p-4"} rounded-full ${
              isActive
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            } transition-colors transform hover:scale-105`}
            title={isActive ? "Pause" : "Start"}
          >
            {isActive ? (
              <Pause size={isFullscreen ? 36 : 24} />
            ) : (
              <Play size={isFullscreen ? 36 : 24} />
            )}
          </button>
          <button
            onClick={resetTimer}
            className={`${
              isFullscreen ? "p-6" : "p-4"
            } rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors transform hover:scale-105`}
            title="Reset"
          >
            <RefreshCw size={isFullscreen ? 36 : 24} />
          </button>
          <button
            onClick={skipSession}
            className={`${
              isFullscreen ? "p-6" : "p-4"
            } rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors transform hover:scale-105`}
            title="Skip to next session"
          >
            <SkipForward size={isFullscreen ? 36 : 24} />
          </button>
          <button
            onClick={() => {
              if ("Notification" in window) {
                Notification.requestPermission();
                if (soundEnabled) clickSoundRef.current.play();
              }
            }}
            className={`${
              isFullscreen ? "p-6" : "p-4"
            } rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors transform hover:scale-105`}
            title="Enable notifications"
          >
            <Bell size={isFullscreen ? 36 : 24} />
          </button>
        </div>

        {/* Session counter */}
        <div
          className={`text-center text-gray-600 ${
            isFullscreen ? "text-lg" : ""
          }`}
        >
          <p>
            Completed: <span className="font-medium">{completedSessions}</span>{" "}
            Pomodoros
          </p>
        </div>
      </div>

      {/* Settings popup modal */}
      {showSettings && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleSettings();
          }}
        >
          <div
            className="absolute inset-0 bg-black/30"
            aria-hidden="true"
          ></div>

          <div
            className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-10 ${
              isFullscreen ? "mt-0" : "mt-0"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#18172a]">
                Timer Settings
              </h3>
              <button
                onClick={toggleSettings}
                className="p-1 rounded-full hover:bg-gray-100"
                title="Close settings"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) =>
                    updateSettings("workDuration", e.target.value)
                  }
                  className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-[#18cb96] cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">1 min</span>
                  <span className="text-sm font-medium">
                    {settings.workDuration} min
                  </span>
                  <span className="text-xs text-gray-500">60 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={settings.shortBreak}
                  onChange={(e) => updateSettings("shortBreak", e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-[#18cb96] cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">1 min</span>
                  <span className="text-sm font-medium">
                    {settings.shortBreak} min
                  </span>
                  <span className="text-xs text-gray-500">20 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={settings.longBreak}
                  onChange={(e) => updateSettings("longBreak", e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-[#18cb96] cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">5 min</span>
                  <span className="text-sm font-medium">
                    {settings.longBreak} min
                  </span>
                  <span className="text-xs text-gray-500">40 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Break After (pomodoros)
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={settings.longBreakInterval}
                  onChange={(e) =>
                    updateSettings("longBreakInterval", e.target.value)
                  }
                  className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-[#18cb96] cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">1</span>
                  <span className="text-sm font-medium">
                    {settings.longBreakInterval}
                  </span>
                  <span className="text-xs text-gray-500">8</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={toggleSettings}
                className="px-6 py-2 bg-[#18cb96] text-white rounded-md hover:bg-[#14a085] transition-colors transform hover:scale-105 shadow"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PomodoroTimer;
