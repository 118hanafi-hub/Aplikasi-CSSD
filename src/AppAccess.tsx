import App from './App';

/**
 * The demo does not require an account backend. Keeping this wrapper lets the
 * existing entry point render the application without Supabase credentials.
 */
export default function AppAccess() {
  return <App />;
}
