import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'sweetalert2/src/sweetalert2.scss'

createRoot(document.getElementById("root")!).render(<App />);