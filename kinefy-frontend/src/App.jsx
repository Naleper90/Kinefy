import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './app/pages/auth/Login';
import Dashboard from './app/pages/dashboard/Dashboard';

function App() {
    return (
        <Router>
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
