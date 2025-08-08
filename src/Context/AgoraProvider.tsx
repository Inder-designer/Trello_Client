import React, { ReactNode } from "react";
import AgoraRTC, { AgoraRTCProvider, IAgoraRTCClient } from "agora-rtc-react";

const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export function AgoraProvider({ children }: { children: ReactNode }) {
    return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
}
