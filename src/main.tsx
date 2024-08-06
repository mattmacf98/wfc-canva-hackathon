import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import {WaveFunctionCollapseProvider} from "./contexts/WaveFunctionCollapse";
import {NotificationsProvider} from "./contexts/Notifications";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <NotificationsProvider>
        <WaveFunctionCollapseProvider>
            <App />
        </WaveFunctionCollapseProvider>
    </NotificationsProvider>
)
