import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initNinjaGuard } from './utils/ninjaGuard';

// Ativação do modo de proteção silenciosa contra cópia e inspeção
initNinjaGuard();

createRoot(document.getElementById('root')!).render(<App />);
