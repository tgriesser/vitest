import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/lab';
import { ThemeProvider, useMediaQuery, createTheme } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { createMemoryHistory, InitialEntry, MemoryHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import { Suspense } from 'react';
import { Route, Router, Routes } from 'react-router-dom';
import { Cache, SWRConfig, SWRConfiguration } from 'swr';

export const cache = new Map();

const theme = createTheme();

const ThemeModeProvider = ({ children }: any) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export interface ProviderOptions extends RenderOptions {
  initialEntries?: Array<InitialEntry>;
  route?: string;
  swrConfig?: SWRConfiguration;
}

interface ProvidersProps extends ProviderOptions {
  children: React.ReactNode;
  history: MemoryHistory;
  swrCache: Cache<any>;
}

const Providers = ({ children, history, route, swrCache }: ProvidersProps) => {
  let Wrapper = (
    <Suspense fallback={null}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SWRConfig
          value={{
            dedupingInterval: 0,
            errorRetryCount: 0,
            fetcher: undefined,
            revalidateOnFocus: false,
            provider: () => swrCache,
          }}
        >
          <ThemeModeProvider>
            <SnackbarProvider autoHideDuration={20} maxSnack={1}>
              {children}
            </SnackbarProvider>
          </ThemeModeProvider>
        </SWRConfig>
      </LocalizationProvider>
    </Suspense>
  );

  if (route) {
    Wrapper = (
      <Router location={history!.location} navigator={history!}>
        <Routes>
          <Route element={Wrapper} path={route} />
        </Routes>
      </Router>
    );
  }

  return Wrapper;
};

const renderWithProviders = (
  ui: React.ReactElement,
  options: ProviderOptions = {}
) => {
  const { initialEntries = [], route, swrConfig, ...rest } = options;
  const history = createMemoryHistory({ initialEntries });
  const swrCache = new Map(cache);

  const rtl = render(ui, {
    wrapper: ({ children }) => (
      <Providers history={history} route={route} swrCache={swrCache}>
        {children}
      </Providers>
    ),
    ...rest,
  });

  return {
    ...rtl,
    rerender: (ui: React.ReactElement, rerenderOptions?: ProviderOptions) =>
      renderWithProviders(ui, {
        container: rtl.container,
        ...options,
        ...rerenderOptions,
      }),
    history,
    swrCache,
  };
};

export * from '@testing-library/react';

export { renderWithProviders as render, userEvent as user };
