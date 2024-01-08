import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";

import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerHeader } from "@/components/server/server-header";
import { ServerSection } from "@/components/server/server-section";
import { ServerChannel } from "@/components/server/server-channel";
import { ServerMember } from "@/components/server/server-member";

interface ServerSidebarProps {
  serverId: string;
}

export const ServerSidebar = async ({
  serverId,
}: ServerSidebarProps) => {
  const profile = await currentProfile();
  
  if(!profile) {
    return redirect("/sign-in");
  } 

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        }
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        }
      }
    },
  });

  const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)
  const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)
  const members = server?.members.filter((member) => member.profileId !== profile.id);

  if(!server) {
    return redirect("/sign-in");
  }

  const role = server.members.find((member) => member.profileId === profile.id)?.role;

  return(
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader 
        server={server}
        role={role}
      />
      <ScrollArea className="flex-1 px-3">
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection 
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel 
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}                     
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection 
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Voice Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel 
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection 
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember 
                  key={member.id}
                  member={member}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}