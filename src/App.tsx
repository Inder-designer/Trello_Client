import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Layout from "./Layout/Layout";
import Project from "./pages/Project/Project";
import VerifyInviteToken from "./pages/Invite/VerifyInviteToken.tsx";
import AcceptBoard from "./pages/Invite/AcceptBoard.tsx";
import AllBoards from "./pages/AllBoards/AllBoards";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store/store";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import { useEffect } from "react";
import { setUser } from "@/redux/Slices/userAuthSlice";
import { useGetMeQuery } from "./redux/api/user.ts";
import { AgoraProvider } from "./Context/AgoraProvider.tsx";
import VideoRoom from "./pages/VideoRoom/VideoRoom.tsx";

const queryClient = new QueryClient();

const AppInitializer = () => {
  const { data } = useGetMeQuery({})
  const dispatch = useDispatch();
  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    }
  }, [data, dispatch]);
  return null;
};

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AgoraProvider>
          <AppInitializer />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="/boards" element={<AllBoards />} />
                  <Route path="/board/:id" element={<Project />} />
                  <Route path="/invite/:id" element={<VerifyInviteToken />} />
                  <Route path="/invite/:id" element={<VerifyInviteToken />} />
                  <Route path="/invite/accept-board" element={<AcceptBoard />} />
                  <Route path="/video-room" element={<VideoRoom />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AgoraProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;