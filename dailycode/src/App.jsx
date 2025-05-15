import "./App.css"
import { Route, Routes } from 'react-router';
import Spawn from "./pages/Spawn.jsx";
import UserCreation from "./pages/UserCreation.jsx";
import Home from "./pages/Home.jsx";

function App(){
  return(
    <>
      <Routes>
        <Route path="/" element={<Spawn />}></Route>
        <Route path="/create-user" element={<UserCreation />}></Route>
        <Route path="/home" element={<Home />}></Route>
      </Routes>
    </>
  )
}

export default App
