import "./App.css";
import Home from "./Home";
import Login from "./components/Login";

export default function App() {
  const account = window.walletConnection.account();
  return account.accountId ? <Home /> : <Login />;
}
