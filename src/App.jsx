import Portfolio from "./Portfolio.jsx";
import Admin from "./Admin.jsx";

export default function App() {
  const path = window.location.pathname;
  if (path === "/admin") return <Admin />;
  return <Portfolio />;
}
