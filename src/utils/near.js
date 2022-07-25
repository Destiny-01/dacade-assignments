import environment from "./config";
import { connect, Contract, keyStores, WalletConnection } from "near-api-js";

const nearEnv = environment("testnet");

export async function initializeContract() {
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearEnv
    )
  );
  window.walletConnection = new WalletConnection(near);
  window.accountId = window.walletConnection.getAccountId();
  window.contract = new Contract(
    window.walletConnection.account(),
    nearEnv.contractName,
    {
      viewMethods: ["getStory", "getMyStories", "getStories"],
      changeMethods: ["newStory", "editStory", "deleteStory"],
    }
  );
}

export async function getAccountId() {
  return window.walletConnection.getAccountId();
}

export function login() {
  window.walletConnection.requestSignIn(nearEnv.contractName);
}

export function logout() {
  window.walletConnection.signOut();
  window.location.reload();
}

export function createStory(story) {
  story.createdAt = Date.now().toString();
  return window.contract.newStory({ story });
}

export function deleteStory(id) {
  return window.contract.deleteStory({ id });
}

export function editStory(id, story) {
  return window.contract.editStory({ id, story });
}

export function getStories() {
  return window.contract.getStories();
}

export async function getMyStories() {
  const sender = await getAccountId();
  console.log(sender);
  return window.contract.getMyStories({ sender });
}

export function formatDate(date) {
  let datee = date.length > 13 ? date.slice(0, 13) : date;
  let dateee = new Date(parseInt(datee));
  const dat = dateee.toDateString() + ", " + dateee.toLocaleTimeString();
  return dat.toString();
}
