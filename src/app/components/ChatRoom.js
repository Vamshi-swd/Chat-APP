"use client";
import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { MessageSquare,MessageCircle } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { firestore, auth } from "../../../firebase"; // Adjust paths if needed
import useStore from "../../../store/store";
import "../globals.css" // Adjust paths if needed

export default function ChatRoom() {
  const { messages, setMessages, user, setUser } = useStore();
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const fileInputRef = useRef(null);

  // Listen for messages in real time
  useEffect(() => {
    const messagesRef = collection(firestore, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [setMessages]);

  // Send a new text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(firestore, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              text: replyingTo.text,
              displayName: replyingTo.displayName,
              photoURL: replyingTo.photoURL,
            }
          : null,
        reactions: {},
        attachmentUrl: null,
      });
      setNewMessage("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Reply to a message
  const handleReply = (message) => {
    setReplyingTo(message);
  };

  // Attachment button click
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Upload file to Firebase Storage, then store download URL in Firestore
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `attachments/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);
      await addDoc(collection(firestore, "messages"), {
        text: "",
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              text: replyingTo.text,
              displayName: replyingTo.displayName,
              photoURL: replyingTo.photoURL,
            }
          : null,
        reactions: {},
        attachmentUrl: downloadURL,
      });
      setReplyingTo(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Toggle reaction
  const handleReaction = async (msg, reactionType) => {
    try {
      const msgDoc = doc(firestore, "messages", msg.id);
      const currentReactions = msg.reactions || {};
      if (currentReactions[auth.currentUser.uid] === reactionType) {
        delete currentReactions[auth.currentUser.uid];
      } else {
        currentReactions[auth.currentUser.uid] = reactionType;
      }
      await updateDoc(msgDoc, { reactions: currentReactions });
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Example date label
  const getFormattedDate = () => {
    const now = new Date();
    const options = { day: "numeric", month: "long", year: "numeric" };
    return now.toLocaleDateString("en-US", options);
  };
  
  const displayDate = getFormattedDate();
  
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
<div className="flex flex-col w-1/2  h-screen  border-gray-300 shadow-lg bg-[#F5F5F5]  shadow-[0px_4px_20px_rgba(150,200,250,0.5)] rounded-[10px]">
  {/* TOP BAR */}
  <header className="flex flex-col items-center justify-between bg-gradient-to-r from-[#128C7E] to-[#25D366] w-full px-[12px] py-[14px] border-b border-gray-400 shadow-md text-white">
    <h1 className="text-[30px] font-[900] tracking-wide">Chat App</h1>
    <div className="flex items-center justify-between w-full space-x-4">
      <p className="block p-[6px] text-lg">Welcome, {capitalize(user.displayName)}</p>
      
      <button
        onClick={handleSignOut}
        className="p-[8px] px-[14px] cursor-pointer transition-all bg-[#FF4D4D] rounded-[12px] hover:bg-[#E60000] shadow-md"
      >
        Sign Out
      </button>
    </div>
  </header>




      {/* DATE SEPARATOR */}
      <div className="my-2 text-sm text-center text-gray-500">{displayDate}</div>

      {/* MESSAGES */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {messages.map((msg) => {
          const isCurrentUser = msg.uid === auth.currentUser?.uid;
          const reactions = msg.reactions || {};
          const userReaction = reactions[auth.currentUser?.uid];

          return (
            <div
              key={msg.id}
              className={`group relative my-3 flex items-end ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* Profile pic for other users */}
              {!isCurrentUser && (
                <img
                  src={msg.photoURL}
                  alt={msg.displayName}
                  className="object-cover mb-[30px] mr-2 rounded-b-full"
                  style={{ width: "1.5rem", height: "1.5rem" }}
                />
              )}

              <div className="max-w-md">
                <div
                  className={`p-3 rounded-xl shadow relative ${
                    isCurrentUser
                      ? "bg-blue-500 text-white "
                      : "bg-white text-gray-800 "
                  }`}
                >
                  {/* Display name if not current user */}
                  {!isCurrentUser && (
                    <div className="mb-1 text-xs font-[700]">
                      {msg.displayName}
                    </div>
                  )}
                  {/* For current user, you might also show the name if desired */}
                  {isCurrentUser && (
                    <div className="mb-1 text-xs font-[700] text-right">
                      {msg.displayName}
                    </div>
                  )}

                  {/* Message text */}

                  {msg.text && <div className="space-y-2 leading-relaxed">
                  <div
                       className={ isCurrentUser ? `relative p-[12px] max-w-[75%] text-[14px] bg-[#ECE5DD] text-white rounded-[18px] rounded-tr-none shadow-lg`: `relative p-[12px] max-w-[75%] text-[14px] bg-[#25D366] text-black rounded-[18px] rounded-tl-none shadow-lg`}
                       
                 >
                {msg.text}
                 </div>
                  </div>   
                  }

                  {/* Attachment (if any) */}
                  {msg.attachmentUrl && (
                    <div className="mt-2">
                      <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm underline ${
                          isCurrentUser ? "text-blue-200" : "text-blue-600"
                        }`}
                      >
                        View Attachment
                      </a>
                    </div>
                  )}

                  {/* Reply preview within the bubble */}
                  {msg.replyTo && (
                    <div className="p-2 mt-2 text-sm text-gray-700 border-l-4 border-blue-300 rounded bg-gray-50">
                      <span className="font-bold">
                        {msg.replyTo.displayName}:
                      </span>{" "}
                      {msg.replyTo.text}
                    </div>
                  )}

                  {/* Tick marks for current user */}
                  {isCurrentUser && (
                    <span className="absolute text-xs text-gray-200 bottom-1 right-2">
                      ✓✓
                    </span>
                  )}
                </div>

                {/* Reactions displayed below the bubble */}
                {Object.values(reactions).length > 0 && (
                  <div
                    className={`flex space-x-2 mt-1 ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {Object.entries(reactions).map(([uid, reaction]) => (
                      <span
                        key={uid}
                        className="px-2 py-1 text-sm bg-gray-200 rounded-full"
                      >
                        {reaction}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reaction bar on hover */}
                <div
                  className={`absolute hidden group-hover:flex items-center space-x-2 bg-white border border-gray-200 p-1 rounded shadow z-10 transition-all duration-200 ease-in-out transform group-hover:scale-100 ${
                    isCurrentUser ? "right-0" : "left-0"
                  } -top-8`}
                >
                  {["👍", "❤️", "😆", "🎉", "🔥", "👀"].map((reactionType) => (
                    <button
                      key={reactionType}
                      onClick={() => handleReaction(msg, reactionType)}
                      className={`hover:scale-125 transition-transform duration-150 px-1 rounded ${
                        userReaction === reactionType ? "bg-blue-100" : ""
                      }`}
                    >
                      {reactionType}
                    </button>
                  ))}
                  <button
                    onClick={() => handleReply(msg)}
                    className="transition-transform duration-150 hover:scale-125"
                  >
                    ↩️
                  </button>
                </div>
              </div>

              {/* Profile pic for current user */}
              {isCurrentUser && (
                <img
                  src={msg.photoURL}
                  alt={msg.displayName}
                  className="object-cover ml-2 rounded-full"
                  style={{ width: "1.5rem", height: "1.5rem" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center justify-between p-2 mx-4 mb-2 border-blue-500 rounded bg-blue-50">
          <div className="text-sm text-gray-700">
            Replying to:{" "}
            <span className="font-bold">{replyingTo.displayName}</span> -{" "}
            {replyingTo.text}
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="px-2 text-xl text-red-500"
          >
            &times;
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center p-2 bg-white border-gray-200"
      >
        <button
          type="button"
          onClick={handleAttachClick}
          className="p-2 rounded-full w-[40px] h-[40px] mr-[6px] border hover:bg-gray-100"
        >
          📎
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />
        <input
          type="text"
          className="flex-1 border w-[45px] p-[15px] h-[40px] rounded-full focus:outline-none"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="p-2 text-white transition-colors w-[40px] ml-[6px] h-[40px] bg-gradient-to-r from-[#128C7E] to-[#25D366] border rounded-full hover:bg-blue-600"
        >
          ➤ 
        </button>
      </form>
    </div>
  );
}