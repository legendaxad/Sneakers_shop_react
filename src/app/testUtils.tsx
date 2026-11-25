import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import ContextProvider from './context/ContextProvider';
import theme from './MaterialTheme';
import { makeStore, type AppStore } from './store';

/**
 * Renders the whole app at `path` with the same provider stack as index.tsx
 * (Redux → Context → Theme → Router). Each call gets a fresh store unless one
 * is passed in (e.g. pre-filled with cart items).
 */
export function renderApp(path: string, store: AppStore = makeStore()) {
  const result = render(
    <Provider store={store}>
      <ContextProvider>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[path]}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </ContextProvider>
    </Provider>,
  );
  return { ...result, store };
}
