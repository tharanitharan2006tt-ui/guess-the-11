import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { RoomState, SOCKET_EVENTS } from '@guess-the-11/shared';
import { socketService } from '../services/socket';
import { UserProfile } from '../services/supabase';
import { LobbyScreen } from './LobbyScreen';
import { GameScreen } from './GameScreen';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

interface RoomControllerProps {
  profile: UserProfile;
}

export const RoomController: React.FC<RoomControllerProps> = ({ profile }) => {
  const { code: pathCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomCode = (pathCode || searchParams.get('room') || '').toUpperCase().trim();

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setError('No room code provided');
      setLoading(false);
      return;
    }

    const socket = socketService.connect();

    // Listen for room state updates
    const handleRoomState = (state: RoomState) => {
      setRoomState(state);
      setLoading(false);
      setError(null);
    };

    socket.on(SOCKET_EVENTS.ROOM_STATE, handleRoomState);

    // Initial Join or Reconnect
    socketService.joinRoom(roomCode, {
      id: profile.id,
      username: profile.username,
      avatar: profile.avatar
    }).then((res) => {
      if (res.success && res.state) {
        setRoomState(res.state);
        setLoading(false);
      } else {
        // Try reconnect if already in room
        socketService.reconnectRoom(roomCode, profile.id).then((reconRes) => {
          if (reconRes.success && reconRes.state) {
            setRoomState(reconRes.state);
            setLoading(false);
          } else {
            setError(res.error || 'Failed to enter room');
            setLoading(false);
          }
        });
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_STATE, handleRoomState);
    };
  }, [roomCode, profile.id, profile.username, profile.avatar]);

  const handleLeave = () => {
    if (roomState) {
      socketService.leaveRoom(roomState.code, profile.id);
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C101D] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
        <p className="font-game font-semibold text-sm tracking-wide uppercase text-slate-300">
          Connecting to Squad Arena...
        </p>
      </div>
    );
  }

  if (error || !roomState) {
    return (
      <div className="min-h-screen bg-[#0C101D] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/30 p-6 rounded-3xl text-center shadow-xl">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-game font-bold text-white mb-2 uppercase">
            Room Entry Failed
          </h2>
          <p className="text-xs text-slate-400 mb-6 font-sans">
            {error || 'Room does not exist or has already completed.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl btn-3d-slate text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // If game is in progress or round end, render GameScreen
  if (roomState.status === 'in_progress' || roomState.status === 'round_end' || roomState.status === 'game_over') {
    return (
      <GameScreen
        roomState={roomState}
        currentUserId={profile.id}
        onReturnHome={handleLeave}
      />
    );
  }

  // Otherwise, waiting in lobby
  return (
    <LobbyScreen
      roomState={roomState}
      currentUserId={profile.id}
      onLeave={handleLeave}
    />
  );
};
