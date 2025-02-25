import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ItemList from './components/ItemList';
import AddItem from './components/AddItem';

function App() {
  return (
    <Router>
      <div className="mx-auto max-w-[1024px] sm:border-x sm:border-gray-200 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ItemList />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/edit" element={<AddItem />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
