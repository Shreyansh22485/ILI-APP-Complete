import { 
    STORE_BRAILLE_LETTER_RESULTS, 
    STORE_BRAILLE_WORD_RESULTS, 
    UPDATE_BRAILLE_TRAINING_PHASE, 
    RESET_BRAILLE_TRAINING 
} from '../actions/actionTypes';

const initialState = {
    currentPhase: 'letter', // 'letter', 'word', 'complete'
    letterTraining: {
        completed: false,
        letterStats: {},
        overallStats: null,
        completedAt: null
    },
    wordTraining: {
        completed: false,
        wordStats: {},
        overallStats: null,
        completedAt: null
    },
    sessionData: {
        startTime: null,
        totalTime: null,
        phasesCompleted: [],
        overallAccuracy: null,
        totalErrors: 0
    }
};

const brailleTrainingReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_BRAILLE_TRAINING':
            // Handle both letter and word training updates
            if (action.payload.letterTraining) {
                const letterStats = action.payload.letterTraining;
                return {
                    ...state,
                    letterTraining: {
                        completed: true,
                        letterStats: letterStats.letterStats || {},
                        overallStats: letterStats,
                        completedAt: letterStats.timestamp
                    },
                    sessionData: {
                        ...state.sessionData,
                        startTime: state.sessionData.startTime || new Date().toISOString(),
                        phasesCompleted: [...state.sessionData.phasesCompleted, 'letter'],
                        totalErrors: state.sessionData.totalErrors + (letterStats.totalErrors || 0)
                    },
                    currentPhase: action.payload.currentPhase || 'word'
                };
            }
            
            if (action.payload.wordTraining) {
                const wordStats = action.payload.wordTraining;
                const letterOverallStats = state.letterTraining.overallStats;
                
                // Calculate combined accuracy
                const combinedAccuracy = letterOverallStats && wordStats.totalTime
                    ? ((letterOverallStats.accuracy || 0) + ((wordStats.wordsCompleted || 0) / 10 * 100)) / 2
                    : (wordStats.wordsCompleted || 0) / 10 * 100;

                return {
                    ...state,
                    wordTraining: {
                        completed: true,
                        wordStats: wordStats.wordStats || {},
                        overallStats: {
                            accuracy: (wordStats.wordsCompleted || 0) / 10 * 100,
                            completedWords: wordStats.wordsCompleted || 0,
                            totalWords: 10,
                            avgTimePerWord: wordStats.averageTimePerWord || 0,
                            totalErrors: wordStats.totalErrors || 0
                        },
                        completedAt: wordStats.timestamp
                    },
                    sessionData: {
                        ...state.sessionData,
                        totalTime: Date.now() - new Date(state.sessionData.startTime).getTime(),
                        phasesCompleted: [...state.sessionData.phasesCompleted, 'word'],
                        overallAccuracy: combinedAccuracy,
                        totalErrors: state.sessionData.totalErrors + (wordStats.totalErrors || 0)
                    },
                    currentPhase: action.payload.currentPhase || 'complete'
                };
            }
            
            return state;

        case STORE_BRAILLE_LETTER_RESULTS:
            return {
                ...state,
                letterTraining: {
                    completed: true,
                    letterStats: action.payload.letterStats,
                    overallStats: action.payload.overallStats,
                    completedAt: action.payload.completedAt
                },
                sessionData: {
                    ...state.sessionData,
                    startTime: state.sessionData.startTime || new Date().toISOString(),
                    phasesCompleted: [...state.sessionData.phasesCompleted, 'letter'],
                    totalErrors: state.sessionData.totalErrors + (action.payload.overallStats?.totalErrors || 0)
                },
                currentPhase: 'word'
            };

        case STORE_BRAILLE_WORD_RESULTS:
            const wordOverallStats = action.payload.overallStats;
            const letterOverallStats = state.letterTraining.overallStats;
            
            // Calculate combined accuracy
            const combinedAccuracy = letterOverallStats && wordOverallStats
                ? (letterOverallStats.accuracy + wordOverallStats.accuracy) / 2
                : wordOverallStats?.accuracy || letterOverallStats?.accuracy || 0;

            return {
                ...state,
                wordTraining: {
                    completed: true,
                    wordStats: action.payload.wordStats,
                    overallStats: wordOverallStats,
                    completedAt: action.payload.completedAt
                },
                sessionData: {
                    ...state.sessionData,
                    totalTime: Date.now() - new Date(state.sessionData.startTime).getTime(),
                    phasesCompleted: [...state.sessionData.phasesCompleted, 'word'],
                    overallAccuracy: combinedAccuracy,
                    totalErrors: state.sessionData.totalErrors + (wordOverallStats?.totalErrors || 0)
                },
                currentPhase: 'complete'
            };

        case UPDATE_BRAILLE_TRAINING_PHASE:
            return {
                ...state,
                currentPhase: action.payload,
                sessionData: {
                    ...state.sessionData,
                    startTime: state.sessionData.startTime || new Date().toISOString()
                }
            };

        case RESET_BRAILLE_TRAINING:
            return {
                ...initialState,
                sessionData: {
                    ...initialState.sessionData,
                    startTime: new Date().toISOString()
                }
            };

        default:
            return state;
    }
};

export default brailleTrainingReducer;
