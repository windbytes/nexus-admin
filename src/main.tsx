import 'antd/dist/reset.css';
// Source: https://ant.design/docs/react/customize-theme#zero-runtime
import 'antd/dist/antd.css';
import '@/styles/global.css';
import '@/styles/tailwind.css';
import { createRoot } from 'react-dom/client';
import { bootstrap } from '@/app/bootstrap';
import { AppProvider } from '@/app/providers/AppProvider';
import App from './App';

const container = document.getElementById('root');

if (container) {
  void bootstrap().then(() => {
    createRoot(container).render(
      <AppProvider>
        <App />
      </AppProvider>
    );
  });
} else {
  console.error('Root element not found');
}
