import {context, ContractPromiseBatch} from "near-sdk-as";
import { Story, storiesStorage, myStories } from "./model";

export function newStory(story: Story): void {
  const allStoies = storiesStorage.values();
  let id = storiesStorage.length;
  const userIds = myStories.get(context.sender);
  for (let i = 0; i < allStoies.length; i++) {
    id = parseInt(allStoies[i].id) === id ? id + 1 : id;
  }
  story.id = id.toString();
  let storedStory = storiesStorage.get(story.id);
  if (storedStory !== null) {
    throw new Error(`a story with id ${story.id} already exists`);
  }
  storiesStorage.set(story.id, Story.fromPayload(story));
  userIds && userIds.push(story.id);
  if (userIds && userIds.length > 0) {
    myStories.set(context.sender, userIds);
  } else {
    myStories.set(context.sender, [story.id]);
  }
}

export function editStory(id: string, story: Story): Story {
  let myStory = storiesStorage.get(id);
  const user = myStories.get(context.sender);
  if (!user || !user.includes(id) || !myStory) {
    throw new Error(`You can't edit this story`);
  }
  if (story.title) {
    myStory.title = story.title;
  }
  if (story.description) {
    myStory.description = story.description;
  }
  if (story.status) {
    myStory.status = story.status;
  }
  storiesStorage.set(id, myStory);
  myStory = storiesStorage.getSome(id);
  return myStory;
}

export function deleteStory(id: string): string[] {
  const user = myStories.get(context.sender);
  if (!user) {
    throw new Error(`You can't delete this story`);
  }
  const myStory = user.includes(id);
  if (!myStory) {
    throw new Error(`You can't delete this story`);
  }
  storiesStorage.delete(id);
  const j = myStories.getSome(context.sender);
  const edited: string[] = [];
  for (let i = 0; i < j.length; i++) {
    if (parseInt(j[i]) !== parseInt(id)) edited.push(j[i]);
  }
  myStories.set(context.sender, edited);
  return edited;
}

export function getStories(): Story[] | null {
  const allStories = storiesStorage.values();
  let filter: Story[] = [];
  for (let i = 0; i < allStories.length; i++) {
    parseInt(allStories[i].status) === 1 && filter.push(allStories[i]);
  }
  if (filter.length !== 0) {
    return filter;
  } else {
    return null;
  }
}

export function getMyStories(sender: string): Story[] | null {
  const myStoriesId = myStories.get(sender);
  const allStories = storiesStorage.values();
  let filter: Story[] = [];
  for (let i = 0; i < allStories.length; i++) {
    if (myStoriesId) {
      myStoriesId.includes(allStories[i].id) && filter.push(allStories[i]);
    }
  }
  if (filter.length !== 0) {
    return filter;
  } else {
    return null;
  }
}


export function buyMeACoffee(id: string): void {
  let storedStory = storiesStorage.get(id);
  if (storedStory === null) {
    throw new Error(`a story with id ${id} does not exists`);
  }

  ContractPromiseBatch.create(storedStory.owner).transfer(context.attachedDeposit);
}