import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";
import { setUserData } from "../redux/userSlice";
import SideBar from "../components/sidebar";
import ChatArea from "../components/ChatArea";
import ArtiFact from "../components/ArtiFact";

function Home() {
  const dispatch = useDispatch();
  const {userData} = useSelector(state=>state.user)
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const signInInProgress = useRef(false);

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserData(data));
    } catch (error) {
      console.error("Failed to complete Google sign-in:", error);
      throw error;
    }
  };

  const googleLogin = async () => {
    if (signInInProgress.current) return;

    signInInProgress.current = true;
    setIsSigningIn(true);
    setLoginError("");

    try {
      const data = await signInWithPopup(auth, googleProvider);
      const token = await data.user.getIdToken();
      await handleLogin(token);
    } catch (error) {
      switch (error.code) {
        case "auth/popup-blocked":
          setLoginError("Your browser blocked the sign-in popup. Allow pop-ups for this site and try again.");
          break;
        case "auth/popup-closed-by-user":
          setLoginError("Google sign-in was closed before it finished. Try again when you're ready.");
          break;
        case "auth/cancelled-popup-request":
          setLoginError("A Google sign-in request was already in progress. Please try again.");
          break;
        default:
          console.error("Google sign-in failed:", error);
          setLoginError("Unable to sign in with Google. Please try again.");
      }
    } finally {
      signInInProgress.current = false;
      setIsSigningIn(false);
    }
  };
  return (
    <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">

<SideBar/>
<ChatArea/>
<ArtiFact/>



{!userData &&       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
        <div className="w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
              Welocome to CortexAI
            </h2>
            <p className="text-[13px] text-slate-500">
              Please login to continue using the app.
            </p>
          </div>
          {loginError && (
            <p className="text-[13px] text-red-400" role="alert">
              {loginError}
            </p>
          )}
          <button
            className="w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            onClick={googleLogin}
            disabled={isSigningIn}
          >
            <FcGoogle size={15} />
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </button>
        </div>
      </div>}

    </div>
  );
}

export default Home;
