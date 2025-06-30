import Test from "./Pages/Test/Test";
import TestOld from "./Pages/Test/Test_old";
import TestSelection from "./Pages/Test/TestSelection";
import Login from "./Pages/Login/Login";
import Create from "./Pages/Create/Create";
import Results from "./Pages/Results/Results";
import BrailleResults from "./Pages/Results/BrailleResults";
import AdminLanding from "./Pages/Admin/AdminLanding"
import StudentData from "./Pages/Admin/StudentData"
import Resources from "./Pages/Admin/Resources"
import BrailleAnalytics from "./Pages/Admin/BrailleAnalytics"
import {BrowserRouter, Routes, Route} from 'react-router-dom'
function App() {
  return (
    <div className="App bg-gray-100">
      <BrowserRouter>
          <div className={''}>            <Routes>
              <Route path={'/'} element={<Login />}/>
              <Route path={'/test-selection'} element={<TestSelection />}/>
              <Route path={'/test'} element={<Test />}/>              <Route path={'/test-original'} element={<TestOld />}/>
              <Route path={'/create'} element={<Create />}/>
              <Route path={'/results'} element={<Results />}/>
              <Route path={'/results-braille'} element={<BrailleResults />}/>
              <Route path={'/adminLanding'} element={<AdminLanding />}/>
              <Route path={'/studentData'} element={<StudentData />}/>
              <Route path={'/resources'} element={<Resources />}/>
              <Route path={'/braille-analytics'} element={<BrailleAnalytics />}/>
            </Routes>
          </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
