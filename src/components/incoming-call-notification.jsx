const IncomingCallNotification = ({ incomingCall, acceptCall, rejectCall }) => {
  const { room, caller } = incomingCall;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "white",
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <p>
        Incoming call from <strong>{caller}</strong>
      </p>
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => acceptCall(room)}
          style={{
            padding: "10px 15px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Accept
        </button>
        <button
          onClick={() => rejectCall(room)}
          style={{
            padding: "10px 15px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default IncomingCallNotification;
