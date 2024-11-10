import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) {
      setSelectedChatType("channel");
    } else {
      setSelectedChatType("contact");
    }
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };
  console.log("List", contacts);

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contact.image && contact.image.url ? (
                  <AvatarImage
                    src={contact.image.url}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`${
                      selectedChatData && selectedChatData._id === contact._id
                        ? "bg-[#ffffff22] border-2 border-white/70"
                        : getColor(contact.color)
                    } uppercase w-10 h-10 text-lg border flex items-center justify-center rounded-full`}
                  >
                    {contact.firstName
                      ? contact.firstName[0]
                      : contact.email[0]}
                  </div>
                )}
              </Avatar>
            )}
            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            {isChannel ? (
              <span>{contact.name}</span>
            ) : (
              <span>
                {contact.firstName} {contact.lastName}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
