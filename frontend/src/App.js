import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Grader from './pages/Grader';
import TestResults from './pages/TestResults';
function App() {
  return (
    <BrowserRouter>
      <div className="App">
          <Routes> 
            <Route path = "/" element={<Grader/>}/>
            <Route path = "/grader" element={<Grader/>}/>
            <Route path="/teste" element={<TestResults />} />
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
