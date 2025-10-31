import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MeetingLobby from "./components/MeetingLobby";
import VideoMeetComponent from "./components/VideoMeetComponent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MeetingLobby />} />
        <Route path="/meeting/:id" element={<VideoMeetComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
