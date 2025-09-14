import { StytchProvider } from '@stytch/react';
import { StytchUIClient } from '@stytch/vanilla-js';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { Authenticate, Login, Logout } from "./Auth";
import TodoEditor from "./Todos";

const PUBLIC_TOKEN = import.meta.env.VITE_STYTCH_PUBLIC_TOKEN as string | undefined
const MOCK_MODE = !PUBLIC_TOKEN
const stytch = PUBLIC_TOKEN ? new StytchUIClient(PUBLIC_TOKEN) : undefined

function App() {
    const content = (
        <>
            <main>
                <h1>TODO App Demo</h1>
                {MOCK_MODE && (
                    <p style={{ background: '#fff3cd', color: '#664d03', padding: '.5rem .75rem', borderRadius: 8 }}>
                        Mock auth mode: no Stytch credentials detected. Login is bypassed for local demo.
                    </p>
                )}
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/authenticate" element={<Authenticate/>}/>
                        <Route path="/todoapp" element={<TodoEditor/>}/>
                        <Route path="*" element={<Navigate to="/todoapp"/>}/>
                    </Routes>
                </Router>
            </main>
            <footer>
                <Logout/>
            </footer>
        </>
    )
    if (stytch) {
        return <StytchProvider stytch={stytch}>{content}</StytchProvider>
    }
    return content
}

export default App

