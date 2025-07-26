import { MoreVertical, Plus, Search, Send } from "lucide-react";
import { useState } from "react";

function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  // Mock data - replace with actual API data
  const conversations = [
    {
      id: 1,
      name: "Silvia Maharjan",
      avatar:
        "https://res.cloudinary.com/dztpup0g9/image/upload/v1750863020/cubicle/clients/mobybzsjdtvsnpjujs12.jpg",
      lastMessage:
        "Here is the Update. let me know if its alright: https://www.tutorme.vercel.app/",
      time: "Just Now",
      online: true,
      project: "TutorMe Web App",
      unread: false,
    },
    {
      id: 2,
      name: "Pradip Shrestha",
      avatar:
        "https://res.cloudinary.com/dztpup0g9/image/upload/v1750863020/cubicle/clients/mobybzsjdtvsnpjujs12.jpg",
      lastMessage: "You Please clear the dues first! 😊",
      time: "1m",
      online: false,
      project: "Techspire LMS",
      unread: true,
    },
    {
      id: 3,
      name: "Sanjay Thapa",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Any Updates?",
      time: "1m",
      online: true,
      project: "Ujama E-Library",
      unread: true,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "other",
      text: "Here is the Update. let me know if its alright: https://www.tutorme.vercel.app/",
      time: "2:30 PM",
    },
    {
      id: 2,
      sender: "me",
      text: "Can you change the hero image?",
      time: "2:32 PM",
    },
    {
      id: 3,
      sender: "me",
      text: "Everything else is alright",
      time: "2:32 PM",
    },
    {
      id: 4,
      sender: "other",
      text: "Sure Man! I'll push the changes EOD",
      time: "2:35 PM",
    },
    {
      id: 5,
      sender: "other",
      text: "...",
      time: "typing",
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Add message sending logic here
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-[85vh] flex overflow-hidden">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            <div className="flex items-center space-x-2">
              <span className="bg-[#18cb96] text-white text-xs px-2 py-1 rounded-full">
                3
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Plus size={18} className="text-[#18cb96]" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search messages"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18cb96]/20 focus:border-[#18cb96]"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation, index) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(index)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation === index
                  ? "bg-[#18cb96]/5 border-r-2 border-r-[#18cb96]"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {conversation.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conversation.time}
                    </span>
                  </div>

                  {conversation.project && (
                    <div className="text-xs text-[#18cb96] bg-[#18cb96]/10 px-2 py-1 rounded mb-1 inline-block">
                      {conversation.project}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>

                  {conversation.unread && (
                    <div className="w-2 h-2 bg-[#18cb96] rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Active Conversation */}
      <div className="flex-1 flex flex-col">
        {selectedConversation === null ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
              {/* Chat Icon */}
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                WorkSage Messaging
              </h3>
              <p className="text-gray-500">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={conversations[selectedConversation]?.avatar}
                      alt={conversations[selectedConversation]?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {conversations[selectedConversation]?.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {conversations[selectedConversation]?.name}
                    </h3>
                    <p className="text-sm text-green-500">
                      {conversations[selectedConversation]?.online
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>

                <button className="p-2 hover:bg-gray-200 rounded">
                  <MoreVertical size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "other" && (
                    <div className="flex items-end space-x-2">
                      <img
                        src={conversations[selectedConversation]?.avatar}
                        alt={conversations[selectedConversation]?.name}
                        className="w-8 h-8 rounded-full object-cover mb-1"
                      />
                      <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                        <p className="text-sm">{message.text}</p>
                        {message.time !== "typing" && (
                          <p className="text-xs mt-1 text-gray-500">
                            {message.time}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {message.sender === "me" && (
                    <div className="bg-[#18cb96] text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <p className="text-sm">{message.text}</p>
                      {message.time !== "typing" && (
                        <p className="text-xs mt-1 text-[#18cb96]/70">
                          {message.time}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18cb96]/20 focus:border-[#18cb96] pr-12"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-3 rounded-lg transition-colors ${
                    messageInput.trim()
                      ? "bg-[#18cb96] text-white hover:bg-[#18cb96]/90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InboxPage;
