import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import MyJourney from './pages/MyJourney';
import Summary from './pages/Summary';
import Progress from './pages/Progress';
import Highlights from './pages/Highlights';
import Profile from './pages/Profile';
import HelpCenter from './pages/HelpCenter';

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="journey" element={<MyJourney />} />
            <Route path="summary" element={<Summary />} />
            <Route path="progress" element={<Progress />} />
            <Route path="highlights" element={<Highlights />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<HelpCenter />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;