import { UPDATE_PRETEST_INFO, UPDATE_POSTTEST_INFO, UPDATE_LECTURE_INFO } from '../actions/actionTypes';

const initialState = {
    preTest: {
        timeTaken: null,
        score: null,
        questionData: null
    },
    postTest: {
        timeTaken: null,
        score: null,
        questionData: null
    },
    lecture: {
        audioTimeTaken: null,
        textTimeTaken: null,
        timeTaken: null,
        audioData: null,
        audioEventsSummary: null,
        modeChangeEvents: null,
        pageAudio: [],    // Added array to store all audio times
        pageText: [],     // Added array to store all text times
        // Keep these for backward compatibility
        pageAudio1: null,  
        pageAudio2: null, 
        pageAudio3: null, 
        pageAudio4: null, 
        pageAudio5: null, 
        pageText1: null, 
        pageText2: null, 
        pageText3: null, 
        pageText4: null,
        pageText5: null
    },
};

const testInfoReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_PRETEST_INFO:
            return {
                ...state,
                preTest: {
                    timeTaken: action.payload.timeTaken,
                    score: action.payload.score,
                    questionData: action.payload.questionData
                }
            };
        case UPDATE_POSTTEST_INFO:
            return {
                ...state,
                postTest: {
                    timeTaken: action.payload.timeTaken,
                    score: action.payload.score,
                    questionData: action.payload.questionData
                }
            };
        case UPDATE_LECTURE_INFO:
            return {
                ...state,
                lecture: {
                    audioTimeTaken: action.payload.audioTimeTaken,
                    textTimeTaken: action.payload.textTimeTaken,
                    timeTaken: action.payload.timeTaken,
                    audioData: action.payload.audioData,
                    audioEventsSummary: action.payload.audioEventsSummary,
                    modeChangeEvents: action.payload.modeChangeEvents,
                    pageAudio: action.payload.pageAudio || [],
                    pageText: action.payload.pageText || [],
                    // Keep these for backward compatibility
                    pageAudio1: action.payload.pageAudio1,
                    pageAudio2: action.payload.pageAudio2,
                    pageAudio3: action.payload.pageAudio3,
                    pageAudio4: action.payload.pageAudio4,
                    pageAudio5: action.payload.pageAudio5,
                    pageText1: action.payload.pageText1,
                    pageText2: action.payload.pageText2,
                    pageText3: action.payload.pageText3,
                    pageText4: action.payload.pageText4,
                    pageText5: action.payload.pageText5,
                }
            };
        default:
            return state;
    }
};

export default testInfoReducer;
