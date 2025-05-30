import "./App.css"
import { Route, Routes } from 'react-router';
import Spawn from "./pages/Spawn.jsx";
import UserCreation from "./pages/UserCreation.jsx";
import Home from "./pages/Home.jsx";
import UserSettings from "./pages/UserSettings.jsx";
import Project from "./pages/Project.jsx";
import Profile from "./pages/Profile.jsx";
import Verification from "./pages/Verification.jsx";

function App(){
  return(
    <>
      <Routes>
        <Route path="/" element={<Spawn />}></Route>
        <Route path="create-user" element={<UserCreation />}></Route>
        <Route path="home" element={<Home />}></Route>
        <Route path="user-settings" element={<UserSettings />}></Route>
        <Route path="project/:id" element={<Project />}></Route>
        <Route path="profile/:user" element={<Profile />}></Route>
        <Route path="verification/:user" element={<Verification />}></Route>
      </Routes>
    </>
  )
}

export default App
