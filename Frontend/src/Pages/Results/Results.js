import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import Navbar from "../Navbar/Navbar";
import BeatLoader from "react-spinners/BeatLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AudioTimeline from "./AudioTimeline";

const computeCommonTimeline = (audioEventsSummary) => {
    let maxTime = 0;
    Object.values(audioEventsSummary || {}).forEach((audio) => {
      [...(audio.pauses || []), ...(audio.replays || [])].forEach((eventStr) => {
        const match = eventStr.match(/(\d+)s/);
        if (match) {
          const t = parseInt(match[1], 10);
          if (t > maxTime) maxTime = t;
        }
      });
    });
    return maxTime < 10 ? 10 : maxTime;
  };

export default function Results() {
  const navigate = useNavigate();
  const studentInfo = useSelector((state) => state.studentInfo);
  const preTestInfo = useSelector((state) => state.testInfo.preTest);
  const lectureInfo = useSelector((state) => state.testInfo.lecture);
  console.log("lectureInfo:", lectureInfo);
  console.log("audioEvents:", lectureInfo.audioEventsSummary);
  const postTestInfo = useSelector((state) => state.testInfo.postTest);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const audioData = lectureInfo.audioData;
  const commonTimelineDuration = lectureInfo.audioEventsSummary
    ? computeCommonTimeline(lectureInfo.audioEventsSummary)
    : 10;

  // Get all sentences with timing data (both audio and text)
  const sentenceTimings = React.useMemo(() => {
    const timings = [];
    
    // Handle dynamic sentence data
    if (lectureInfo.pageAudio && Array.isArray(lectureInfo.pageAudio)) {
      // Create timings entries for each sentence
      for (let i = 0; i < lectureInfo.pageAudio.length; i++) {
        timings.push({
          sentenceNum: i + 1, // Add 1 to make it 1-based instead of 0-based
          audioTime: lectureInfo.pageAudio[i] || 0,
          textTime: lectureInfo.pageText && lectureInfo.pageText[i] ? lectureInfo.pageText[i] : 0
        });
      }
    } 
    // Legacy data handling (for backward compatibility)
    else if (lectureInfo.pageAudio1 !== undefined) {
      for (let i = 1; i <= 5; i++) {
        if (lectureInfo[`pageAudio${i}`] !== undefined || lectureInfo[`pageText${i}`] !== undefined) {
          timings.push({
            sentenceNum: i,
            audioTime: lectureInfo[`pageAudio${i}`] || 0,
            textTime: lectureInfo[`pageText${i}`] || 0
          });
        }
      }
    }
    
    return timings;
  }, [lectureInfo]);

  useEffect(() => {
    if (!audioData || audioData.length === 0) return;

    const canvas1 = document.getElementById("audio-chart1");
    const canvas2 = document.getElementById("audio-chart2");

    if (canvas1 && canvas2) {
      const ctx1 = canvas1.getContext("2d");
      const ctx2 = canvas2.getContext("2d");

      var playVals = audioData.filter((item) =>
        item.split("-")[0].includes("play")
      );
      var pauseVals = audioData.filter((item) =>
        item.split("-")[0].includes("pause")
      );

      const sliderData1 = playVals.map((item) => parseInt(item.split("-")[1]));
      const dataPoints1 = sliderData1.map((value, index) => ({
        x: index,
        y: value,
      }));

      const sliderData2 = pauseVals.map((item) => parseInt(item.split("-")[1]));
      const dataPoints2 = sliderData2.map((value, index) => ({
        x: index,
        y: value,
      }));

      const lineChart1 = new Chart(ctx1, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Time",
              data: dataPoints1,
              borderColor: "black",
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              title: {
                display: true,
                text: "Instance",
              },
            },
            y: {
              title: {
                display: true,
                text: "Timestamp in Audio (s)",
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: false,
            },
          },
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            display: true,
          },
        },
      });

      const lineChart2 = new Chart(ctx2, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Time",
              data: dataPoints2,
              borderColor: "black",
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              title: {
                display: true,
                text: "Instance",
              },
            },
            y: {
              title: {
                display: true,
                text: "Timestamp in Audio (s)",
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: false,
            },
          },
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            display: true,
          },
        },
      });
    } else {
      console.error("Canvas elements not found");
    }
  }, [audioData]);

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) {
      return "N/A";
    }
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min} min ${sec} sec`;
  };

  // ... existing heart rate code ...
  
  const handleSaveResults = () => {
    setLoading(true);
    var rawAudioData = "";
    if (lectureInfo.audioData) {
      for (var i in lectureInfo.audioData) {
        rawAudioData += `|${lectureInfo.audioData[i]}|`;
      }
    }
    
    // Prepare audio and text times arrays (for backward compatibility)
    let audioTimes = [];
    let textTimes = [];
    
    // If we have legacy format data
    if (lectureInfo.pageAudio1 !== undefined) {
      audioTimes = [
        lectureInfo?.pageAudio1,
        lectureInfo?.pageAudio2,
        lectureInfo?.pageAudio3,
        lectureInfo?.pageAudio4,
        lectureInfo?.pageAudio5,
      ];
      textTimes = [
        lectureInfo?.pageText1,
        lectureInfo?.pageText2,
        lectureInfo?.pageText3,
        lectureInfo?.pageText4,
        lectureInfo?.pageText5,
      ];
    } 
    // If we have the new format data
    else if (sentenceTimings.length > 0) {
      // Take the first 5 sentences for backward compatibility
      const timingsToUse = sentenceTimings.slice(0, 5);
      
      audioTimes = timingsToUse.map(t => t.audioTime);
      textTimes = timingsToUse.map(t => t.textTime);
      
      // Pad arrays to length 5 if needed
      while (audioTimes.length < 5) audioTimes.push(0);
      while (textTimes.length < 5) textTimes.push(0);
    }
    
    const data = {
      studentInfo: studentInfo,
      preTestInfo: preTestInfo,
      lectureInfo: lectureInfo,
      postTestInfo: postTestInfo,
      beforePreTestHeart: heartRateData["Before Pre Test"]["amount"],
      afterPreTestHeart: heartRateData["After Pre Test"]["amount"],
      beforeLectureHeart: heartRateData["Before Lecture"]["amount"],
      afterLectureHeart: heartRateData["After Lecture"]["amount"],
      beforePostTestHeart: heartRateData["Before Post Test"]["amount"],
      afterPostTestHeart: heartRateData["After Post Test"]["amount"],
      audioRawData: rawAudioData,
      audioTimes,
      textTimes,
    };
    
    fetch("http://localhost:5000/api/addToSheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        toast.success("Results have been saved successfully!");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occurred while saving the results.");
      });
    setLoading(false);
  };

  // Handle downloading results as JSON file
  const handleDownloadResults = () => {
    // Create a complete data object with all results
    const resultsData = {
      studentInfo: {
        name: studentInfo?.name || "Unknown Student",
        timestamp: new Date().toISOString()
      },
      preTest: {
        score: preTestInfo?.score || 0,
        timeTaken: preTestInfo?.timeTaken || 0,
        questionData: preTestInfo?.questionData || []
      },
      lecture: {
        audioTimeTaken: lectureInfo?.audioTimeTaken || 0,
        textTimeTaken: lectureInfo?.textTimeTaken || 0,
        totalTimeTaken: lectureInfo?.timeTaken || 0,
        sentenceTimings: sentenceTimings || [],
        audioEvents: lectureInfo?.audioEventsSummary || {},
        modeChanges: lectureInfo?.modeChangeEvents || []
      },
      postTest: {
        score: postTestInfo?.score || 0,
        timeTaken: postTestInfo?.timeTaken || 0,
        questionData: postTestInfo?.questionData || []
      },
      heartRate: {
        beforePreTest: heartRateData["Before Pre Test"]?.amount || "",
        afterPreTest: heartRateData["After Pre Test"]?.amount || "",
        beforeLecture: heartRateData["Before Lecture"]?.amount || "",
        afterLecture: heartRateData["After Lecture"]?.amount || "",
        beforePostTest: heartRateData["Before Post Test"]?.amount || "",
        afterPostTest: heartRateData["After Post Test"]?.amount || ""
      }
    };

    // Convert to JSON string and create a Blob
    const jsonData = JSON.stringify(resultsData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `results_${studentInfo?.name || "student"}_${new Date().toISOString().split("T")[0]}.json`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Results downloaded successfully!");
  };

  // ... existing heart rate code ...
  const [heartRateData, setHeartRateData] = useState({
    "Before Pre Test": { amount: "", display: false },
    "After Pre Test": { amount: "", display: false },
    "Before Lecture": { amount: "", display: false },
    "After Lecture": { amount: "", display: false },
    "Before Post Test": { amount: "", display: false },
    "After Post Test": { amount: "", display: false },
  });

  const handleSubmit = (type) => {
    setHeartRateData({
      ...heartRateData,
      [type]: { ...heartRateData[type], display: true },
    });
  };

  const navigateHome = () => {
    navigate("/");
  };

  return (
    <div>
      <Navbar />
      <ToastContainer />
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <BeatLoader color={"#123abc"} loading={loading} size={15} />
        </div>
      ) : (
        <div className="py-4 px-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold">Test Results</h1>
            <p className="text-xl mt-2">
              Student: {studentInfo?.name || "N/A"}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Time Metrics</h2>
              <ul className="list-disc list-inside">
                <li className="text-lg mb-2">
                  PreTest Time: {formatTime(preTestInfo?.timeTaken)}
                </li>
                <li className="text-lg mb-2">
                  Lecture Audio Time: {formatTime(lectureInfo?.audioTimeTaken)}
                </li>
                <li className="text-lg mb-2">
                  Lecture Text Time: {formatTime(lectureInfo?.textTimeTaken)}
                </li>
                <li className="text-lg">
                  PostTest Time: {formatTime(postTestInfo?.timeTaken)}
                </li>
              </ul>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Scores</h2>
              <ul className="list-disc list-inside">
                <li className="text-lg mb-2">
                  PreTest Score:{" "}
                  {preTestInfo.score !== null
                    ? `${preTestInfo.score}/10`
                    : "N/A"}
                </li>
                <li className="text-lg">
                  PostTest Score:{" "}
                  {postTestInfo.score !== null
                    ? `${postTestInfo.score}/10`
                    : "N/A"}
                </li>
              </ul>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Audio Timings</h2>
              <div className="max-h-96 overflow-y-auto pr-2">
                <ul className="list-disc list-inside">
                  {sentenceTimings.length > 0 ? (
                    sentenceTimings.map((timing, index) => (
                      <li key={index} className="text-lg mb-2">
                        Sentence {timing.sentenceNum} Time: {formatTime(timing.audioTime)}
                      </li>
                    ))
                  ) : (
                    <li className="text-lg mb-2">No audio timing data available</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Text Timings</h2>
              <div className="max-h-96 overflow-y-auto pr-2">
                <ul className="list-disc list-inside">
                  {sentenceTimings.length > 0 ? (
                    sentenceTimings.map((timing, index) => (
                      <li key={index} className="text-lg mb-2">
                        Sentence {timing.sentenceNum} Time: {formatTime(timing.textTime)}
                      </li>
                    ))
                  ) : (
                    <li className="text-lg mb-2">No text timing data available</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Audio Events</h2>
              <div className="max-h-96 overflow-y-auto overflow-x-auto">
                {lectureInfo.audioEventsSummary && Object.keys(lectureInfo.audioEventsSummary).length > 0 ? (
                  Object.keys(lectureInfo.audioEventsSummary).map((sentenceKey) => (
                    <AudioTimeline
                      key={sentenceKey}
                      audioName={sentenceKey}
                      pauses={lectureInfo.audioEventsSummary[sentenceKey].pauses}
                      replays={lectureInfo.audioEventsSummary[sentenceKey].replays}
                      timelineDuration={commonTimelineDuration}
                    />
                  ))
                ) : (
                  <p className="text-lg">No audio events recorded</p>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Mode Changes</h2>
              <div className="max-h-96 overflow-y-auto">
                {lectureInfo.modeChangeEvents && lectureInfo.modeChangeEvents.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {lectureInfo.modeChangeEvents.map((event, index) => (
                      <li key={index} className="text-lg mb-2">
                        {event}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-lg">No mode changes recorded</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Heart Rate Monitor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(heartRateData).map((type, index) => (
                <div
                  key={index}
                  className="flex gap-5 bg-white shadow-lg rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold mb-2 pt-1">{type} -</h3>
                  {heartRateData[type].display ? (
                    <p className="text-lg pt-1">
                      {heartRateData[type].amount} BPM
                    </p>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(type);
                      }}
                      className="flex items-center"
                    >
                      <input
                        type="text"
                        value={heartRateData[type].amount}
                        onChange={(e) =>
                          setHeartRateData({
                            ...heartRateData,
                            [type]: {
                              ...heartRateData[type],
                              amount: e.target.value,
                            },
                          })
                        }
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
                      />
                      <button
                        type="submit"
                        className="ml-4 bg-white text-black py-2 px-4 border-[1px] border-black rounded hover:bg-gray-400 transition duration-300"
                      >
                        Submit
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-5">
            <button
              onClick={handleSaveResults}
              className="bg-white text-black py-2 px-4 mt-2 border-[1px] border-black rounded hover:bg-gray-400 transition duration-300"
            >
              Save Results
            </button>
            <button
              onClick={handleDownloadResults}
              className="bg-white text-black py-2 px-4 mt-2 border-[1px] border-black rounded hover:bg-gray-400 transition duration-300"
            >
              Download Results
            </button>
            <button
              onClick={navigateHome}
              className="bg-white text-black py-2 px-4 mt-2 border-[1px] border-black rounded hover:bg-gray-400 transition duration-300"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
