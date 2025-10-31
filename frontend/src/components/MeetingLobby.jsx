import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/meetingLobby.module.css";

const MeetingLobby = () => {
  const [meetingId, setMeetingId] = useState("");
  const [duration, setDuration] = useState("");
  const [lawyerId, setLawyerId] = useState("");
  const [createdMeeting, setCreatedMeeting] = useState(null); // Store created meeting info

  const [userName , setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedLawyer = localStorage.getItem("lawyerId");
    const savedDuration = localStorage.getItem("duration");
    if (savedLawyer) setLawyerId(savedLawyer);
    if (savedDuration) setDuration(savedDuration);
  }, []);

  const handleGenerateMeeting = async () => {
    if (!lawyerId.trim()) {
      alert("Please enter your Lawyer ID");
      return;
    }

    if (!duration || duration <= 0) {
      alert("Please set a valid meeting duration (in minutes)");
      return;
    }
try {
  const response = await axios.post("http://localhost:5000/api/meeting/create", {
    lawyerId: lawyerId.trim(),
    duration: parseInt(duration),
  });

  const { meetingId } = response.data;

  // Save meeting info locally
  localStorage.setItem("lawyerId", lawyerId);
  localStorage.setItem("duration", duration);

  // Store meeting details for display
  setCreatedMeeting({
    meetingId,
    meetingLink: `${window.location.origin}/meeting/${meetingId}`,
  });

  // ✅ Correct navigation
  // navigate(`/meeting/${meetingId}`, {
  //   state: {
  //     lawyerId: lawyerId.trim(),
  //     role: "lawyer",
  //     duration: parseInt(duration),
  //     userName: userName?.trim() || "Lawyer",
  //   },
  // });
} catch (error) {
  console.error("❌ Error creating meeting:", error.response?.data || error.message);
  alert("❌ Error creating meeting. Please try again.");
}

  };

  const handleJoinMeeting = () => {
    if (meetingId.trim() === "") {
      alert("Please enter a valid Meeting ID");
      return;
    }

    navigate(`/meeting/${meetingId}`, {
      state: { role: "client" , username : userName.trim() },
    });
  };

  const handleCopyLink = () => {
    if (createdMeeting) {
      navigator.clipboard.writeText(createdMeeting.meetingLink);
      alert("📋 Meeting link copied!");
    }
  };

  return (
    <div className={styles.container}>
      <h2>⚖️ Legal Mate Meeting Portal</h2>

      {/* ✅ Lawyer Section */}
      <div className={styles.section}>
        <h3>Generate New Meeting (For Lawyers)</h3>

        <input
          type="text"
          placeholder="Enter your Lawyer ID"
          value={lawyerId}
          onChange={(e) => setLawyerId(e.target.value)}
          className={styles.input}
        />
        <input
        type="text"
        placeholder="Enter Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className={styles.input}
        />

        <input
          type="number"
          placeholder="Enter Duration (in minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleGenerateMeeting} className={styles.button}>
          Generate Meeting
        </button>

        {/* ✅ Show meeting details after creation */}
        {createdMeeting && (
          <div className={styles.meetingInfo}>
            <p><strong>Meeting ID:</strong> {createdMeeting.meetingId}</p>
            <p>
              <strong>Meeting Link:</strong>{" "}
              <span className={styles.link}>{createdMeeting.meetingLink}</span>
            </p>
            <button onClick={handleCopyLink} className={styles.copyBtn}>
              Copy Link
            </button>
            <button
              onClick={() =>
                navigate(`/meeting/${createdMeeting.meetingId}`, {
                  state: {
                    lawyerId: lawyerId.trim(),
                    role: "lawyer",
                    duration: parseInt(duration),
                  },
                })
              }
              className={styles.startBtn}
            >
              Start Meeting
            </button>
          </div>
        )}
      </div>

      {/* ✅ Client Section */}
      <div className={styles.section}>
        <h3>Join Existing Meeting (For Clients)</h3>

        <input
          type="text"
          placeholder="Enter Meeting ID"
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleJoinMeeting} className={styles.button}>
          Join Meeting
        </button>
      </div>
    </div>
  );
};

export default MeetingLobby;
