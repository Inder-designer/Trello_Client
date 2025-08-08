import { useEffect, useState, useRef } from "react";
import AgoraRTC, { ILocalAudioTrack, ILocalVideoTrack } from "agora-rtc-sdk-ng";
import {
    useRTCClient,
    useRemoteUsers,
    IAgoraRTCRemoteUser,
} from "agora-rtc-react";
import { useVideoCallQuery } from "@/redux/api/common";
import { useSearchParams } from "react-router-dom";

const VideoRoom = () => {
    const [searchParams] = useSearchParams();
    const client = useRTCClient();
    const users = useRemoteUsers();

    const channelParam = searchParams.get("channel");
    const uidParam = searchParams.get("uid");
    const tokenParam = searchParams.get("token");

    const CHANNEL = channelParam || "video-room";
    const UID = uidParam ? Number(uidParam) : null;
    const agoraAppId = import.meta.env.VITE_AGORA_APP_ID;
    const { data: videoCallData } = useVideoCallQuery({ channelName: CHANNEL || "", uid: UID || 0 });
    const rtcToken = tokenParam || videoCallData?.token || null;

    const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
    const [ready, setReady] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    // Create local audio/video tracks once
    useEffect(() => {
        const createTracks = async () => {
            try {
                const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                const videoTrack = await AgoraRTC.createCameraVideoTrack();
                setLocalAudioTrack(audioTrack);
                setLocalVideoTrack(videoTrack);
                setReady(true);
            } catch (error) {
                console.error("Error creating local tracks:", error);
            }
        };

        createTracks();

        return () => {
            if (localAudioTrack) localAudioTrack.close();
            if (localVideoTrack) localVideoTrack.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Join Agora channel and publish tracks when ready and token present
    useEffect(() => {
        if (
            !ready ||
            !localAudioTrack ||
            !localVideoTrack ||
            !rtcToken ||
            !agoraAppId ||
            !CHANNEL ||
            UID === null
        ) {
            console.warn("Skipping join: missing channel, uid or token");
            return;
        }

        let joined = false;
        (async () => {
            try {
                await client.join(agoraAppId, CHANNEL, rtcToken, UID);
                // Publish both tracks together as an array
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await client.publish([localAudioTrack, localVideoTrack] as any);
                joined = true;
            } catch (err) {
                console.error("Agora join error:", err);
            }
        })();

        return () => {
            if (!joined) return;
            (async () => {
                try {
                    if (localAudioTrack) {
                        localAudioTrack.stop();
                        localAudioTrack.close();
                    }
                    if (localVideoTrack) {
                        localVideoTrack.stop();
                        localVideoTrack.close();
                    }
                    await client.leave();
                } catch (e) {
                    console.error("Error leaving channel:", e);
                }
            })();
        };
    }, [client, ready, localAudioTrack, localVideoTrack, rtcToken, agoraAppId, CHANNEL, UID]);

    // Play local video track
    useEffect(() => {
        if (localVideoTrack && videoRef.current) {
            localVideoTrack.play(videoRef.current);
        }
    }, [localVideoTrack]);

    // Component to render remote user video
    const RemoteVideoPlayer = ({ user }: { user: IAgoraRTCRemoteUser }) => {
        const remoteVideoRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (user.videoTrack && remoteVideoRef.current) {
                user.videoTrack.play(remoteVideoRef.current);
            }
        }, [user.videoTrack]);

        return (
            <div
                key={user.uid}
                style={{ width: 320, height: 240, margin: 8, backgroundColor: "#000" }}
                ref={remoteVideoRef}
            />
        );
    };

    return (
        <div>
            <div id="local-player" style={{ marginBottom: 20 }}>
                <div style={{ width: 320, height: 240, backgroundColor: "#000" }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
            </div>

            <div id="remote-playerlist" style={{ display: "flex", flexWrap: "wrap" }}>
                {users.map((user) => (
                    <RemoteVideoPlayer key={user.uid} user={user} />
                ))}
            </div>

            <div style={{ marginTop: 20 }}>
                <h3>Connected Users:</h3>
                <ul>
                    <li key="local">Local User (UID: {UID})</li>
                    {users.length > 0 ? (
                        users.map((user) => <li key={user.uid}>User UID: {user.uid}</li>)
                    ) : (
                        <li>No remote users connected</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default VideoRoom;
