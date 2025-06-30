import { combineReducers } from 'redux';
import studentInfoReducer from './studentInfoReducer';
import testInfoReducer from './testInfoReducer';
import brailleTrainingReducer from './brailleTrainingReducer';

const rootReducer = combineReducers({
    studentInfo: studentInfoReducer,
    testInfo: testInfoReducer,
    brailleTraining: brailleTrainingReducer
});

export default rootReducer;
