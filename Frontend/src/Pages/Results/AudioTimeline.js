import React from "react";

const AudioTimeline = ({ audioName, pauses = [], replays = [], timelineDuration = 60 }) => {
  // Build events array adding type info
  const events = [];
  
  // Add pause events
  pauses.forEach((timeValue) => {
    // Extract time from string like "8s" to get just the number
    const time = parseInt(timeValue, 10) || 0;
    events.push({ time, type: "pause" });
  });
  
  // Add replay events
  replays.forEach((timeValue) => {
    // Extract time from string like "8s" to get just the number
    const time = parseInt(timeValue, 10) || 0;
    events.push({ time, type: "replay" });
  });

  // Sort events by time
  events.sort((a, b) => a.time - b.time);

  const timelineWidth = Math.min(timelineDuration, 100);
  
  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">{audioName}</h3>
      <div className="relative h-8 bg-gray-200 rounded-md overflow-hidden">
        {events.map((event, index) => {
          const position = Math.min(
            (event.time / timelineDuration) * 100,
            100
          );
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${position}%`,
                top: 0,
                transform: "translateX(-50%)",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: event.type === "pause" ? "red" : "blue",
                margin: "0 auto",
              }}
              title={`${event.type} at ${event.time}s`}
            >
              <div style={{ fontSize: "10px", marginTop: "14px", textAlign: "center" }}>
                {event.time}s
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <span className="inline-block mr-4">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
          Pauses: {pauses.length}
        </span>
        <span className="inline-block">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
          Replays: {replays.length}
        </span>
      </div>
    </div>
  );
};

export default AudioTimeline;