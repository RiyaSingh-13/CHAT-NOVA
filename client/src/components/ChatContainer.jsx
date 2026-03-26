import React, { use, useContext, useEffect, useRef } from "react";
import assets, { messagesDummyData } from "../assets/assets.js";
import { formatMessageTime } from "../lib/Utils.js";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useState } from "react";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  // Debug: log messages array on every render
  console.log("[ChatContainer] messages:", messages);

  // handle sending a message
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (input.trim() === "") return null;
    const sendResult = await sendMessage({ text: input.trim() });
    console.log("[ChatContainer] sendMessage result:", sendResult);
    setInput("");
  };
  // handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = null;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id).then((result) => {
        console.log("[ChatContainer] getMessages result:", result);
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/*header*/}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500 ">
        <img
          src={
            selectedUser.profilePic
              ? selectedUser.profilePic
              : assets.avatar_icon
          }
          alt="Profile"
          className="w-10  rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"> </span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
        <img
          src={assets.help_icon}
          alt="Help"
          className="max-md:hidden max-w-5 "
        />
      </div>

      {/* chatarea */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.filter(Boolean).map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && "flex-row-reverse"}`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-57.5 border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-50 md:text-sm font-light rounded-lg mb-8 break-all bg-black text-yellow-300 ${msg.senderId === authUser._id ? "rounded-br-none" : "rounded-bl-none"}`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser.profilePic || assets.avatar_icon
                    : selectedUser.profilePic || assets.avatar_icon
                }
                alt="Profile"
                className="w-7  rounded-full "
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>
      {/* bottom area */}
      <div className="absolute bottom-0 left-0 w-full flex items-center px-4 py-3 z-10">
        <div className="flex-1 flex items-center bg-gray-100/12 rounded-full px-3">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage() : null)}
            type="text"
            placeholder="send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 "
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/*"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer ml-3"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-white text-lg font-medium">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
