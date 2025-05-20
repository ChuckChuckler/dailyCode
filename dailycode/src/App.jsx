import "./App.css"
import { Route, Routes } from 'react-router';
import Spawn from "./pages/Spawn.jsx";
import UserCreation from "./pages/UserCreation.jsx";
import Home from "./pages/Home.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import UserSettings from "./pages/UserSettings.jsx";

function App(){
  return(
    <>
      <Routes>
        <Route path="/" element={<Spawn />}></Route>
        <Route path="/create-user" element={<UserCreation />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/user-profile" element={<UserProfile />}></Route>
        <Route path="/user-settings" element={<UserSettings />}></Route>
      </Routes>
    </>
  )
}

export default App
