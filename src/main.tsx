import {StrictMode} from 'react';
import {createRoot, Root} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;

if (!(container as any)._root) {
  (container as any)._root = createRoot(container);
}

const root: Root = (container as any)._root;

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
