import { SET_STUDENT_NAME, SET_TEST_INFO } from './actionTypes';
import { UPDATE_PRETEST_INFO, UPDATE_POSTTEST_INFO, UPDATE_LECTURE_INFO } from './actionTypes';

export const setStudentName = (name) => ({
    type: SET_STUDENT_NAME,
    payload: name
});

export const setTestInfo = (testInfo) => ({
    type: SET_TEST_INFO,
    payload: testInfo
});

export const updatePreTestInfo = (timeTaken, score, questionData) => ({
    type: UPDATE_PRETEST_INFO,
    payload: { timeTaken, score, questionData }
});

export const updatePostTestInfo = (timeTaken, score, questionData) => ({
    type: UPDATE_POSTTEST_INFO,
    payload: { timeTaken, score, questionData }
});

// Updated to handle dynamic arrays instead of fixed fields
export const updateLectureInfo = (audioTimeTaken, textTimeTaken, timeTaken, audioData, audioEventsSummary, pageAudio, pageText, modeChangeEvents) => ({
    type: UPDATE_LECTURE_INFO,
    payload: { 
        audioTimeTaken, 
        textTimeTaken, 
        timeTaken, 
        audioData, 
        audioEventsSummary, 
        pageAudio,  // Now an array of all page audio timings
        pageText,   // Now an array of all page text timings
        modeChangeEvents,
        // For backward compatibility
        pageAudio1: pageAudio && pageAudio[0] ? pageAudio[0] : null,
        pageAudio2: pageAudio && pageAudio[1] ? pageAudio[1] : null,
        pageAudio3: pageAudio && pageAudio[2] ? pageAudio[2] : null,
        pageAudio4: pageAudio && pageAudio[3] ? pageAudio[3] : null,
        pageAudio5: pageAudio && pageAudio[4] ? pageAudio[4] : null,
        pageText1: pageText && pageText[0] ? pageText[0] : null,
        pageText2: pageText && pageText[1] ? pageText[1] : null,
        pageText3: pageText && pageText[2] ? pageText[2] : null,
        pageText4: pageText && pageText[3] ? pageText[3] : null,
        pageText5: pageText && pageText[4] ? pageText[4] : null
    }
});

