import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import App from './app/App';
import theme from './app/MaterialTheme';
import './css/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* injectFirst lets the plain CSS files in src/css override MUI defaults predictably */}
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* reducedMotion="user": framer-motion skips movement when the OS asks for reduced motion */}
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MotionConfig>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
