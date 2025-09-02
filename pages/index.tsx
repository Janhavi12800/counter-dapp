// pages/index.tsx
import { ConnectWallet, useAddress, useContract, useConnectionStatus } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

export default function Home() {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { contract } = useContract("0x45a93093533CF1E25582D22E23F7019E5d102a11","custom");

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetaMask(true);
    } else {
      setError("Please install MetaMask to use this dApp");
    }
  }, []);

  // ✅ Fetch counter
  const fetchCounter = async () => {
    try {
      const value = await contract?.call("counter");
      setCounter(Number(value));
    } catch (err) {
      console.error("Error fetching counter:", err);
    }
  };

  // ✅ Fetch owner
  const fetchOwner = async () => {
    try {
      const contractOwner = await contract?.call("owner");
      setOwner(contractOwner);
    } catch (err) {
      console.error("Error fetching owner:", err);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchCounter();
      fetchOwner();
    }
  }, [contract]);

  // ✅ Generic contract call
  const callContract = async (method: string) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const tx = await contract?.call(method);
      console.log("Transaction:", tx);
      await fetchCounter(); // refresh value after tx
    } catch (err: any) {
      console.error("Error calling contract:", err);
      setError(err.message || "Failed to interact with the contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "30px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          textAlign: "center",
          animation: "fadeIn 1s ease-in-out",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>🚀 Counter dApp</h1>

        {!hasMetaMask ? (
          <div style={{ color: "red", margin: "20px 0" }}>
            {error || "MetaMask is not installed. Please install it to continue."}
          </div>
        ) : (
          <>
            <ConnectWallet
              theme="dark"
              modalSize="compact"
              
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                margin: "10px 0",
                fontSize: "16px",
                transition: "transform 0.2s",
              }}
            />

            {error && (
              <div
                style={{
                  color: "#ff4d4d",
                  margin: "10px 0",
                  fontWeight: "bold",
                  animation: "fadeIn 0.5s ease-in",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <p style={{ margin: "20px 0", fontSize: "14px" }}>
              {address
                ? `✅ Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                : "🔴 Not connected"}
            </p>

            {/* ✅ Show counter value */}
            <h2 style={{ margin: "20px 0", fontSize: "22px" }}>
              Counter Value:{" "}
              {counter !== null ? (
                <span style={{ fontWeight: "bold", fontSize: "26px" }}>{counter}</span>
              ) : (
                "Loading..."
              )}
            </h2>

            {/* ✅ Loading spinner */}
            {loading && (
              <div style={{ margin: "15px 0" }}>
                <div className="spinner"></div>
              </div>
            )}

            {/* ✅ Buttons */}
            <button
              onClick={() => callContract("increment")}
              disabled={!address || connectionStatus === "connecting" || loading}
              style={btnStyle(address, connectionStatus, loading)}
            >
              ➕ Increment
            </button>

            <button
              onClick={() => callContract("decrement")}
              disabled={!address || connectionStatus === "connecting" || loading}
              style={btnStyle(address, connectionStatus, loading)}
            >
              ➖ Decrement
            </button>

            {owner && address?.toLowerCase() === owner.toLowerCase() && (
              <button
                onClick={() => callContract("reset")}
                disabled={!address || connectionStatus === "connecting" || loading}
                style={btnStyle(address, connectionStatus, loading)}
              >
                🔄 Reset (Owner Only)
              </button>
            )}
          </>
        )}
      </div>

      {/* ✅ Spinner styles */}
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #ffffff;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

const btnStyle = (address: string | undefined, connectionStatus: string, loading: boolean) => ({
  backgroundColor: address ? "#3b82f6" : "#cccccc",
  color: "white",
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  cursor: address && !loading ? "pointer" : "not-allowed",
  fontSize: "16px",
  marginTop: "12px",
  width: "100%",
  transition: "all 0.2s",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  opacity: connectionStatus === "connecting" || loading ? 0.6 : 1,
  transform: loading ? "scale(0.95)" : "scale(1)",
});
