import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import DemoTest from './DemoTest'
import BrailleLetterTraining from './BrailleLetterTraining';
import BrailleWordTraining from './BrailleWordTraining';
import Navbar from "../Navbar/Navbar";
import { updateBrailleTrainingPhase, resetBrailleTraining } from '../../redux/actions';

export default function Test() {
    const [isRecording, setIsRecording] = useState(false);
    const [showTraining, setShowTraining] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const videoRef = useRef(null);
    const recordedChunks = useRef([]);
    const dragItem = useRef(null);
    const dragItemPosition = useRef({ x: 0, y: 0 });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Get Braille training state from Redux
    const brailleTraining = useSelector(state => state.brailleTraining);
    const currentPhase = brailleTraining.currentPhase;
    const studentName = useSelector(state => state.studentInfo.name);

    useEffect(() => {
        const handleDragStart = (e) => {
            dragItemPosition.current = {
                x: dragItem.current.offsetLeft - e.clientX,
                y: dragItem.current.offsetTop - e.clientY,
            };
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleDrag = (e) => {
            e.preventDefault();
            dragItem.current.style.left = `${e.clientX + dragItemPosition.current.x}px`;
            dragItem.current.style.top = `${e.clientY + dragItemPosition.current.y}px`;
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        if (dragItem.current) {
            dragItem.current.addEventListener('mousedown', handleDragStart);
        }

        return () => {
            if (dragItem.current) {
                dragItem.current.removeEventListener('mousedown', handleDragStart);
            }
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startBrailleTraining = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;  // Mute the video element to prevent echo
                videoRef.current.play();
                setIsRecording(true);

                let options = { mimeType: 'video/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.warn(`${options.mimeType} is not supported, using default MIME type.`);
                    delete options.mimeType;
                }

                const recorder = new MediaRecorder(stream, options);
                recorder.ondataavailable = event => {
                    if (event.data && event.data.size > 0) {
                        recordedChunks.current.push(event.data);
                    }
                };

                recorder.onstart = () => {
                    console.log("Recording started");
                };

                recorder.onerror = (event) => {
                    console.error("Recording error:", event.error);
                };

                recorder.start();
                setMediaRecorder(recorder);
                setShowTraining(true);
                dispatch(resetBrailleTraining());
                dispatch(updateBrailleTrainingPhase('letter'));
            })
            .catch(err => {
                console.error("Error accessing media devices:", err);
            });
    };

    const startDemo = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsRecording(true);
                dispatch(updateBrailleTrainingPhase('demo'));

                let options = { mimeType: 'video/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.warn(`${options.mimeType} is not supported, using default MIME type.`);
                    delete options.mimeType;
                }

                const recorder = new MediaRecorder(stream, options);
                recorder.ondataavailable = event => {
                    if (event.data && event.data.size > 0) {
                        recordedChunks.current.push(event.data);
                    }
                };

                recorder.start();
                setMediaRecorder(recorder);
                setShowTraining(true);
            })
            .catch(err => {
                console.error("Error accessing media devices:", err);
            });
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }

        if (currentPhase !== 'demo' && mediaRecorder) {
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks.current, { type: "video/webm" });
                if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "braille-training-recording.webm";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else {
                    console.warn("No data was recorded.");
                }                setIsRecording(false);
                setMediaRecorder(null);
                recordedChunks.current = [];
                navigate('/results-braille');
            };
        }
        setIsRecording(false);
        setMediaRecorder(null);
    };

    const handleBraillePhaseCompletion = (phase, results = null) => {
        if (phase === 'demo') {
            stopRecording();
            dispatch(updateBrailleTrainingPhase('letter'));
            setShowTraining(false);
            return;
        }
        
        if (phase === 'letter') {
            // Letter training completed, move to word training
            dispatch(updateBrailleTrainingPhase('word'));
        } else if (phase === 'word') {
            // Word training completed, finish
            dispatch(updateBrailleTrainingPhase('complete'));
            stopRecording();
        }
    };
    
    const openLink = () => {
        window.open('https://forms.gle/9mrnrRrHBxqs7tzL9', '_blank');
    };

    return (
        <div className="mx-auto min-h-screen">
            <Navbar/>
            <div ref={dragItem} className="absolute cursor-move" style={{ right: '1rem', bottom: '1rem' }}>
                <video 
                    ref={videoRef} 
                    className="w-48 h-36 bg-black border-2 border-gray-300 rounded" 
                    controls 
                    muted 
                />
            </div>

            {!showTraining && (
                <div className="flex flex-col py-10 px-5">
                    <p className='text-3xl font-bold mb-6'>Welcome to Braille Keyboard Training</p>
                    <p className='text-xl pb-2'>Instructions: </p>
                    <p>1. You need to give permission for the webcam and microphone for the training session to start.</p>
                    <p>2. This training has 2 main phases: Letter Training and Word Training.</p>
                    <p>3. In Letter Training, you'll learn to type individual Braille letters using the 8-key keyboard layout.</p>
                    <p>4. The Braille keyboard uses 8 keys: F, D, S, A (top row) and J, K, L, ; (bottom row).</p>
                    <p>5. Each letter has a unique pattern of keys that you need to press simultaneously.</p>
                    <p>6. In Word Training, you'll practice typing complete 3-letter words using the patterns you learned.</p>
                    <p>7. Voice instructions will guide you through each step of the training.</p>
                    <p>8. Visual feedback will show you which keys to press for each letter.</p>
                    <p>9. Your progress and performance will be tracked and analyzed.</p>
                    <p>10. Complete both training phases to finish the program.</p>
                    <p>11. You MUST complete both phases to store your training data.</p>
                    
                    <div className='userButton'>
                        <button
                            onClick={openLink}
                            className="border-[1px] border-black mt-5 mx-5 px-4 py-2 bg-white text-black rounded hover:bg-gray-400 transition duration-300"
                        >
                            User Details
                        </button>
                    </div>

                    {!isRecording && (
                        <button
                            onClick={startDemo}
                            className="border-[1px] border-black mt-5 mx-5 px-4 py-2 bg-white text-black rounded hover:bg-gray-400 transition duration-300"
                        >
                            Demo Training
                        </button>
                    )}
                    <button
                        onClick={isRecording ? stopRecording : startBrailleTraining}
                        className="border-[1px] border-black mt-5 mx-5 px-4 py-2 bg-white text-black rounded hover:bg-gray-400 transition duration-300"
                    >
                        {isRecording ? "End Training" : "Begin Braille Training"}
                    </button>
                </div>
            )}

            {showTraining && (
                <div>
                    {currentPhase === 'demo' && (
                        <DemoTest onCompletion={(time, score) => handleBraillePhaseCompletion('demo', { time, score })} />
                    )}
                    {currentPhase === 'letter' && (
                        <BrailleLetterTraining 
                            onComplete={(results) => handleBraillePhaseCompletion('letter', results)} 
                            studentId={studentName}
                        />
                    )}
                    {currentPhase === 'word' && (
                        <BrailleWordTraining 
                            onComplete={(results) => handleBraillePhaseCompletion('word', results)} 
                            studentId={studentName}
                        />
                    )}
                    {currentPhase === 'complete' && (
                        <div className="text-center p-8">
                            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Training Complete!</h2>
                            <p className="text-lg mb-4">Congratulations! You have successfully completed the Braille keyboard training.</p>                            <button 
                                onClick={() => navigate('/results-braille')}
                                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300"
                            >
                                View Results
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
