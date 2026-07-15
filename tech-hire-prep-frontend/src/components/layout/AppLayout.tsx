import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Avatar } from "../ui/Avatar";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { navLinks, tabs } from "../../constants/icon";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Modal } from "../ui/Modal";
import { io, type Socket } from "socket.io-client";
import { matchApi } from "../../services/backendApi";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/notifications";
import type { InterviewRequest } from "../../types";
import { IncomingInterviewRequest } from "../match/IncomingInterviewRequest";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<InterviewRequest | null>(null);
  const [acceptingRequest, setAcceptingRequest] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (!user?.id) {
      setIncomingRequest(null);
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let active = true;
    let pollingId: number | null = null;

    const syncActiveRequest = async () => {
      try {
        const response = await matchApi.getQueueStatus();
        const request = (response as any)?.data ?? response;
        if (!active) return;

        if (request?.status === "pending" && request?.requesterId && String(request.requesterId) !== user.id) {
          setIncomingRequest(request);
        } else if (request?.status === "matched" && request?.sessionId) {
          setIncomingRequest(null);
          if (String(request.requesterId ?? "") === user.id) {
            navigate(`/sessions/${request.sessionId}`);
          }
        } else {
          setIncomingRequest(null);
        }
      } catch {
        if (active) {
          setIncomingRequest(null);
        }
      }
    };

    void syncActiveRequest();
    pollingId = window.setInterval(() => {
      void syncActiveRequest();
    }, 5000);

    const token = localStorage.getItem("token");
    if (!token) {
      return () => {
        active = false;
        if (pollingId) window.clearInterval(pollingId);
      };
    }

    const socketUrl = import.meta.env.VITE_WS_URL || "http://localhost:4400";
    const socket = io(socketUrl, { auth: { token }, query: { scope: "app-layout" } });
    socketRef.current = socket;

    socket.on("interview-request", (payload: any) => {
      const request: InterviewRequest = {
        requestId: String(payload.requestId),
        status: "pending",
        requesterId: payload.requesterId ? String(payload.requesterId) : undefined,
        requesterName: payload.requesterName ?? undefined,
        interviewType: payload.interviewType ?? undefined,
        preferredRole: payload.preferredRole ?? undefined,
        difficulty: payload.difficulty ?? undefined,
        preferredLanguage: payload.preferredLanguage ?? undefined,
        duration: payload.duration ?? undefined,
        description: payload.description ?? undefined,
        requesterHeadline: payload.requesterHeadline ?? undefined,
      };

      if (request.requesterId && request.requesterId !== user.id) {
        setIncomingRequest(request);
        pushToast({
          title: "Interview request received",
          description: "A peer sent you a mock interview request.",
          variant: "success",
        });
      }
    });

    socket.on("interview-assigned", (payload: any) => {
      setIncomingRequest(null);
      if (payload?.sessionId) {
        pushToast({
          title: "Match accepted",
          description: "Your interview has been assigned.",
          variant: "success",
        });
        navigate(`/sessions/${payload.sessionId}`);
      }
    });

    socket.on("interview-closed", () => {
      setIncomingRequest(null);
      pushToast({
        title: "Request closed",
        description: "That interview request was no longer available.",
        variant: "info",
      });
    });

    return () => {
      active = false;
      if (pollingId) window.clearInterval(pollingId);
      socket.off("interview-request");
      socket.off("interview-assigned");
      socket.off("interview-closed");
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [navigate, pushToast, user?.id]);

  const handleAcceptRequest = async () => {
    if (!incomingRequest?.requestId) return;
    try {
      setAcceptingRequest(true);
      const session = await matchApi.acceptMatch(incomingRequest.requestId);
      setIncomingRequest(null);
      pushToast({ title: "Accepted", description: "Interview request accepted.", variant: "success" });
      navigate(`/sessions/${session.id}`);
    } catch (error) {
      pushToast({ title: "Accept failed", description: getErrorMessage(error, "Failed to accept the interview request."), variant: "error" });
    } finally {
      setAcceptingRequest(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!incomingRequest?.requestId) return;
    try {
      setRejectingRequest(true);
      await matchApi.rejectMatch(incomingRequest.requestId);
      setIncomingRequest(null);
      pushToast({ title: "Rejected", description: "Interview request rejected.", variant: "success" });
    } catch (error) {
      pushToast({ title: "Reject failed", description: getErrorMessage(error, "Failed to reject the interview request."), variant: "error" });
    } finally {
      setRejectingRequest(false);
    }
  };

  return (
    <div className="app-shell font-sans text-primary bg-app">
      <header className="app-topnav shadow-sm justify-between">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded-md hover:bg-surface-hover text-muted"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <FiMenu size={20} />
          </button>
          <Link
            to="/dashboard"
            className="text-xl font-bold tracking-tight text-accent flex items-center gap-2"
          >
            <span>Tech-Hire-Prep</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              {user?.name}
            </span>
            <Avatar name={user?.name} size="sm" />
          </div>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar shadow-sm">
          <div className="flex-1 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path ||
                location.pathname.startsWith(`${link.path}/`);

              if (link.label === "Profile") {
                return (
                  <div key={link.path}>
                    <button
                      onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                      className={`app-sidebar-link w-full justify-between ${isActive ? "active" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          size={18}
                          color={isActive ? link.color : link.color}
                        />
                        <span>{link.label}</span>
                      </div>
                      <span>{isProfileExpanded ? <FaCaretDown /> : <FaCaretRight />}</span>
                    </button>
                    {isProfileExpanded && (
                      <div className="pl-6 space-y-1 mt-1">
                        {tabs.map((t) => {
                          const Icon = t.icon;
                          return <NavLink
                            key={t.key}
                            to={`/profile?tab=${t.key}`}
                            className="block px-3 py-1.5 text-xs font-medium text-muted hover:text-text hover:bg-surface-hover rounded"
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                size={15}
                                color={isActive ? t.color : t.color}
                              />
                              <span>{t.label}</span>
                            </div>
                          </NavLink>
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`app-sidebar-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} color={isActive ? link.color : link.color} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
          <div className="pt-4 border-t border-subtle">
            <button
              onClick={handleLogout}
              className="app-sidebar-link w-full text-danger hover:text-danger hover:bg-danger/10"
            >
              <FiLogOut size={18} color="red"/>
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="app-main">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {incomingRequest && incomingRequest.requesterId !== user?.id && (
        <Modal isOpen onClose={() => setIncomingRequest(null)} title="Incoming interview request" size="xl">
          <IncomingInterviewRequest
            request={incomingRequest}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            accepting={acceptingRequest}
            rejecting={rejectingRequest}
          />
        </Modal>
      )}

      {isMobileNavOpen && (
        <div className="md:hidden">
          <div
            className="mobile-nav-overlay"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="mobile-nav-drawer shadow-xl scrollbar-thin">
            <div className="flex justify-between items-center mb-6">
              <Link
                to="/dashboard"
                className="text-xl font-bold tracking-tight text-accent"
              >
                Tech-Hire-Prep
              </Link>
              <button
                className="p-2 rounded-md hover:bg-surface-hover text-muted"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-surface-hover border border-subtle">
              <Avatar name={user?.name} size="md" />
              <div>
                <p className="font-semibold text-sm text-text-primary">
                  {user?.name}
                </p>
                <p className="text-xs text-muted truncate max-w-37.5">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  location.pathname === link.path ||
                  location.pathname.startsWith(`${link.path}/`);
                if (link.label === "Profile") {
                  return (
                    <div key={link.path}>
                      <button
                        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                        className={`app-sidebar-link w-full justify-between ${isActive ? "active" : ""} text-base py-3`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={18}
                            color={link.color}
                          />
                          <span>{link.label}</span>
                        </div>
                        <span>{isProfileExpanded ? <FaCaretDown /> : <FaCaretRight />}</span>
                      </button>
                      {isProfileExpanded && (
                        <div className="pl-4 space-y-1 mt-1">
                          {tabs.map((t) => {
                            const Icon = t.icon;
                            return <NavLink
                              key={t.key}
                              to={`/profile?tab=${t.key}`}
                              onClick={() => setIsMobileNavOpen(false)}
                              className="block px-3 py-1.5 text-sm font-medium text-muted hover:text-text hover:bg-surface-hover rounded"
                            >
                              <div className="flex items-center gap-3">
                                <Icon
                                  size={15}
                                  color={isActive ? t.color : t.color}
                                />
                                <span>{t.label}</span>
                              </div>
                            </NavLink>
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`app-sidebar-link ${isActive ? "active" : ""} text-base py-3`}
                  >
                    <Icon size={20} color={link.color} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
            <div className="pt-4 border-t border-subtle mt-auto">
              <button
                onClick={handleLogout}
                className="app-sidebar-link w-full text-danger hover:text-danger hover:bg-danger/10 text-base py-3"
              >
                <FiLogOut size={20} color="red" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



