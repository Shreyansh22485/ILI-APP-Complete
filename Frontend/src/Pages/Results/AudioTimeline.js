import React from "react";

const parseEvent = (eventStr) => {
  // Expected event format: "11s (word: \"needs\")"
  const timestampMatch = eventStr.match(/(\d+)s/);
  const wordMatch = eventStr.match(/\(word:\s*"([^"]+)"\)/);
  const time = timestampMatch ? parseInt(timestampMatch[1], 10) : 0;
  const word = wordMatch ? wordMatch[1] : "";
  return { time, word };
};

const AudioTimeline = ({ audioName, pauses = [], replays = [],timelineDuration: commonTimelineDuration }) => {
  // Build events array adding type info
  const events = [];
  pauses.forEach((e) => {
    const { time, word } = parseEvent(e);
    events.push({ time, word, type: "pause" });
  });
  replays.forEach((e) => {
    const { time, word } = parseEvent(e);
    events.push({ time, word, type: "replay" });
  });

  if (events.length === 0) {
    return <div></div>;
  }

  // Group events by timestamp
  const grouped = events.reduce((acc, event) => {
    acc[event.time] = acc[event.time] || [];
    acc[event.time].push(event);
    return acc;
  }, {});

  // Determine timeline max time (using 10s buffer if needed)
  // Determine local max time
  const localMaxTime = Math.max(...events.map((e) => e.time), 0);
  // Use common timeline if provided
  const timelineDuration = commonTimelineDuration ? commonTimelineDuration : (localMaxTime < 10 ? 10 : localMaxTime);

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3 className="text-xl font-bold mb-2">{audioName}</h3>
      <div style={{ position: "relative", height: "80px", borderBottom: "2px solid #ccc" }}>
        {Object.keys(grouped).map((timeKey) => {
          const group = grouped[timeKey];
          // Calculate left percentage for marker group
          const leftPercent = (group[0].time / timelineDuration) * 100;
          // Determine vertical offsets for each event in this group
          const offsets = group.length === 1
            ? [0]
            : group.length === 2
              ? [-50, 0]
              : group.map((_, index) => -20 + (index * (40 / (group.length - 1))));

          return group.map((event, idx) => {
            const color = event.type === "pause" ? "red" : "blue";
            return (
              <div
                key={`${timeKey}-${idx}`}
                style={{
                  position: "absolute",
                  left: `${leftPercent}%`,
                  top: `calc(50% + ${offsets[idx]}px)`,
                  transform: "translateX(-50%)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    margin: "0 auto",
                  }}
                />
                <div style={{ fontSize: "10px", marginTop: "2px" }}>
                  {event.time}s
                  <br />
                  {event.word}
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};

export default AudioTimeline;