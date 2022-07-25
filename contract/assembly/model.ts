import { PersistentUnorderedMap, context, u128 } from "near-sdk-as";

@nearBindgen
export class Story {
  id: string;
  title: string;
  description: string;
  status: string;
  owner: string;
  createdAt: u128;
  public static fromPayload(payload: Story): Story {
    const story = new Story();
    story.id = payload.id;
    story.title = payload.title;
    story.description = payload.description;
    story.status = payload.status;
    story.createdAt = payload.createdAt;
    story.owner = context.sender;
    return story;
  }
}

export const storiesStorage = new PersistentUnorderedMap<string, Story>(
  "ALL_STORIES"
);

export const myStories = new PersistentUnorderedMap<string, string[]>(
  "MY_STORIES"
);
