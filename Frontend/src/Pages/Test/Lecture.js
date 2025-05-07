import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateLectureInfo } from "../../redux/actions";
import "./lecture.css"; // Import CSS file

export default function Lecture({ onCompletion }) {
  const [lectureStarted, setLectureStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [audioTimer, setAudioTimer] = useState(0);
  const [textTimer, setTextTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(0);
  const [mode, setMode] = useState("audio"); // State to track the current mode (audio or text)
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [pageAudio, setPageAudio] = useState([]);
  const [pageText, setPageText] = useState([]);
  const [audioPlayEvents, setAudioPlayEvents] = useState([]);
  const [modeChangeEvents, setModeChangeEvents] = useState([]);
  
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const utteranceRef = useRef(null);
  const nextButtonRef = useRef(null);
  const endLectureButtonRef = useRef(null);
  const playButtonRef = useRef(null);
  const replayButtonRef = useRef(null);
  
  // Fetch content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/fetchContent");
        const data = await response.json();
        
        if (data.message === "Content Fetched") {
          setSentences(data.data);
          
          // Initialize page timing arrays with correct length
          const initialPageAudio = data.data.map((_, idx) => ({ id: idx, val: 0 }));
          const initialPageText = data.data.map((_, idx) => ({ id: idx, val: 0 }));
          
          setPageAudio(initialPageAudio);
          setPageText(initialPageText);
        } else {
          setError("Failed to fetch content");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setError("Failed to fetch content");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);
  
  // Handle text-to-speech functionality
  const speakSentence = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Configure speech settings
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Event handlers for speech
      utterance.onstart = () => {
        handleAudioPlay();
      };
      
      utterance.onend = () => {
        handleAudioPause();
        
        // Auto-advance to next sentence when audio finishes if not the last sentence
        if (currentPage < sentences.length - 1 && mode === "audio" && lectureStarted) {
          handleNextPage();
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-speech not supported in this browser');
      alert('Text-to-speech is not supported in your browser. Please use a modern browser like Chrome, Firefox, or Edge.');
    }
  };
  
  const pauseSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      handleAudioPause();
    }
  };
  
  const resumeSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      handleAudioPlay();
    }
  };
  
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      handleAudioPause();
    }
  };
  
  const replaySpeech = () => {
    if (sentences[currentPage]) {
      // Record replay event
      const replayString = `Sentence ${currentPage + 1} - replay at ${Math.floor(audioTimer / 1000)}s`;
      setAudioPlayEvents((prevEvents) => [...prevEvents, replayString]);
      
      // Speak the current sentence again
      speakSentence(sentences[currentPage]);
    }
  };
  
  const handleAudioPause = () => {
    const pauseString = `Sentence ${currentPage + 1} - pause at ${Math.floor(audioTimer / 1000)}s`;
    setAudioPlayEvents((prevEvents) => [...prevEvents, pauseString]);
  };

  const handleAudioPlay = () => {
    const playString = `Sentence ${currentPage + 1} - play at ${Math.floor(audioTimer / 1000)}s`;
    setAudioPlayEvents((prevEvents) => [...prevEvents, playString]);
  };
  
  // Function to toggle between audio and text mode
  const toggleMode = () => {
    const newMode = mode === "audio" ? "text" : "audio";
    const changeString = `Mode change at ${Math.floor(totalTimer / 1000)}s - ${mode} to ${newMode} on sentence ${currentPage + 1}`;
    setModeChangeEvents((prevEvents) => [...prevEvents, changeString]);
    
    if (mode === "audio") {
      // Stop speech when switching to text mode
      stopSpeech();
      setMode("text");
      if (nextButtonRef.current) {
        nextButtonRef.current.focus();
      }
    } else {
      setMode("audio");
      if (playButtonRef.current) {
        playButtonRef.current.focus();
      }
    }
  };
  
  // Navigation functions
  const handleNextPage = () => {
    if (mode === "audio") {
      stopSpeech();
    }
    
    if (currentPage < sentences.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (mode === "audio") {
      stopSpeech();
    }
    
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Start lecture functions
  const startLecture = () => {
    setLectureStarted(true);
    setMode("audio");
    // Start the first sentence with TTS
    if (sentences.length > 0) {
      speakSentence(sentences[0]);
    }
  };
  
  const startTextLecture = () => {
    setLectureStarted(true);
    setMode("text");
  };
  
  // Function to end the lecture
  const endLecture = () => {
    const totalTimeTaken = totalTimer / 1000;
    
    // Prepare audio events summary
    const eventsByAudio = {};
    
    audioPlayEvents.forEach(event => {
      const sentenceNum = event.split(' - ')[0];
      if (!eventsByAudio[sentenceNum]) {
        eventsByAudio[sentenceNum] = {
          pauses: new Set(),
          replays: new Set()
        };
      }
      
      if (event.includes('pause')) {
        eventsByAudio[sentenceNum].pauses.add(event.split('at ')[1]);
      } else if (event.includes('replay')) {
        eventsByAudio[sentenceNum].replays.add(event.split('at ')[1]);
      }
    });

    // Convert sets to arrays for each sentence
    Object.keys(eventsByAudio).forEach(key => {
      eventsByAudio[key] = {
        pauses: Array.from(eventsByAudio[key].pauses),
        replays: Array.from(eventsByAudio[key].replays)
      };
    });
    
    console.log("Audio Events Summary:", eventsByAudio);
    console.log("Mode Change Events:", modeChangeEvents);
    
    // Extract page timing values for all sentences
    const pageAudioValues = pageAudio.map(item => item.val / 1000);
    const pageTextValues = pageText.map(item => item.val / 1000);
    
    // Dispatch the updateLectureInfo action with dynamic arrays
    dispatch(
      updateLectureInfo(
        audioTimer / 1000,
        textTimer / 1000,
        totalTimeTaken,
        audioPlayEvents,
        eventsByAudio,
        pageAudioValues,
        pageTextValues,
        modeChangeEvents
      )
    );
    
    // Clean up and complete
    stopSpeech();
    setLectureStarted(false);
    setAudioTimer(0);
    setTextTimer(0);
    setTotalTimer(0);
    onCompletion(totalTimeTaken);
  };
  
  // Timer effects
  useEffect(() => {
    let interval;
    
    // Timer for audio mode
    if (mode === "audio" && lectureStarted) {
      interval = setInterval(() => {
        setPageAudio((prevPageAudio) => {
          return prevPageAudio.map((curAudio) => {
            if (curAudio.id !== currentPage) {
              return curAudio;
            } else {
              return {
                ...curAudio,
                val: curAudio.val + 1000,
              };
            }
          });
        });
        setAudioTimer((prev) => prev + 1000);
        setTotalTimer((prev) => prev + 1000);
      }, 1000);
    }
    
    // Timer for text mode
    if (mode === "text" && lectureStarted) {
      interval = setInterval(() => {
        setPageText((prevPageText) => {
          return prevPageText.map((curText) => {
            if (curText.id !== currentPage) {
              return curText;
            } else {
              return {
                ...curText,
                val: curText.val + 1000,
              };
            }
          });
        });
        setTextTimer((prev) => prev + 1000);
        setTotalTimer((prev) => prev + 1000);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [mode, currentPage, lectureStarted]);
  
  // Speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Focus play button after page changes in audio mode
  useEffect(() => {
    if (mode === "audio" && lectureStarted && playButtonRef.current) {
      playButtonRef.current.focus();
      
      // Start speaking the current sentence
      if (sentences[currentPage]) {
        speakSentence(sentences[currentPage]);
      }
    }
  }, [currentPage, mode, lectureStarted]);

  if (loading) {
    return (
      <div className="mx-auto py-4 px-8">
        <h2 className="text-2xl font-semibold">Loading content...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto py-4 px-8">
        <h2 className="text-2xl font-semibold text-red-500">Error loading content</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="mx-auto py-4 px-8">
        <h2 className="text-2xl font-semibold">No content available</h2>
        <p>Please add content from the admin panel first.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 px-8">
      <h2 className="text-2xl font-semibold">Lecture</h2>
      <div className="mt-4">
        {!lectureStarted ? (
          <div>
            <h3>Please choose your preferred mode to start the lecture:</h3>
            <button
              onClick={startLecture}
              className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mr-2"
            >
              Start with Audio
            </button>
            <button
              onClick={startTextLecture}
              className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
            >
              Start with Text
            </button>
          </div>
        ) : (
          <div>
            {/* Render either audio or text based on the current mode */}
            {mode === "audio" ? (
              <div>
                {/* Audio mode */}
                <div className="audio-container">
                  <div className="bg-gray-100 p-4 rounded shadow mb-4">
                    <h3 className="font-semibold mb-2">Sentence {currentPage + 1}</h3>
                    <p className="text-gray-700">{sentences[currentPage]}</p>
                    
                    <div className="flex mt-4">
                      <button
                        ref={playButtonRef}
                        onClick={() => {
                          if (window.speechSynthesis && window.speechSynthesis.paused) {
                            resumeSpeech();
                          } else {
                            speakSentence(sentences[currentPage]);
                          }
                        }}
                        className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mr-2"
                      >
                        Play
                      </button>
                      <button
                        onClick={pauseSpeech}
                        className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mr-2"
                      >
                        Pause
                      </button>
                      <button
                        ref={replayButtonRef}
                        onClick={replaySpeech}
                        className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
                      >
                        Replay
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    {pageAudio.map(
                      (curPage) =>
                        curPage.id === currentPage && (
                          <div
                            key={curPage.id}
                            style={{
                              position: "absolute",
                              top: "4rem",
                              right: 0,
                              padding: "0.5rem",
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                              borderRadius: "0 0 0.25rem 0.25rem",
                            }}
                          >
                            Sentence {currentPage + 1} Time: {Math.floor(curPage.val / 1000)}s
                          </div>
                        )
                    )}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      padding: "0.5rem",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "0 0 0.25rem 0.25rem",
                    }}
                  >
                    Audio Time: {Math.floor(audioTimer / 1000)}s
                  </div>
                </div>

                <div className="mt-2">
                  <button
                    onClick={toggleMode}
                    className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
                  >
                    Text Mode
                  </button>
                </div>
              </div>
            ) : (
              // Text mode
              <div>
                <div className="bg-gray-100 p-4 rounded shadow mb-4">
                  <button className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mb-2">
                    Sentence - {currentPage + 1}
                  </button>
                  <p className="mt-2">{sentences[currentPage]}</p>
                </div>
                
                <div className="mt-2">
                  {pageText.map(
                    (curPage) =>
                      curPage.id === currentPage && (
                        <div
                          key={curPage.id}
                          style={{
                            position: "absolute",
                            top: "4rem",
                            right: 0,
                            padding: "0.5rem",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "0 0 0.25rem 0.25rem",
                          }}
                        >
                          Sentence {currentPage + 1} Time: {Math.floor(curPage.val / 1000)}s
                        </div>
                      )
                  )}
                  <div
                    className="text-time-container"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      padding: "0.5rem",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "0 0 0.25rem 0.25rem",
                    }}
                  >
                    Text Time: {Math.floor(textTimer / 1000)}s
                  </div>
                  <button
                    onClick={toggleMode}
                    className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
                  >
                    Audio Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      {lectureStarted && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="mr-2">Page {currentPage + 1} of {sentences.length}</span>
              
              {currentPage !== 0 && (
                <button
                  onClick={handlePreviousPage}
                  className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mr-2"
                >
                  Back
                </button>
              )}
              
              {currentPage !== sentences.length - 1 && (
                <button
                  ref={nextButtonRef}
                  onClick={handleNextPage}
                  className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
                >
                  Next
                </button>
              )}
            </div>
            
            {currentPage === sentences.length - 1 && (
              <button
                onClick={endLecture}
                ref={endLectureButtonRef}
                className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
              >
                End Lecture
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Hidden audio for backward compatibility */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}