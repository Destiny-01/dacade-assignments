import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import abi from "../contract/story.abi.json";

const contractAddress = "0x902a2e5F0aB75E3022E212377A86A030fc1E224a";

let kit;
let contract;

const connectCeloWallet = async () => {
  if (window.celo) {
    try {
      await window.celo.enable();
      const web3 = new Web3(window.celo);
      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];

      contract = new kit.web3.eth.Contract(abi, contractAddress);
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.");
  }
};

const showStory = (id) => {
  contract.methods
    .getStory(id)
    .call()
    .then((story) => {
      document.getElementById("viewModalContent").innerHTML = `
      <h4>${story.title}</h4>
      <h6>${new Date(story.createdAt * 1000)} </h6>
      <p>${story.description}</p>
      `;
    })
    .catch((err) => {
      notification(`⚠️ ${err}`);
      console.log(err);
    });
};

const getStories = () => {
  contract.methods
    .getStories()
    .call()
    .then((stories) => {
      console.log(stories);
      const myStories = stories.filter(
        (x) => x.owner.toUpperCase() === kit.defaultAccount.toUpperCase()
      );
      if (myStories.length === 0 || myStories.every((x) => x.createdAt === 0)) {
        document.getElementById("my-stories").innerHTML = `
          <p>
            You haven't created any stories. Why not create
            <a href="#addModal" class="modal-trigger">one</a>
          </p>
        `;
        return;
      }
      const publicStories = stories.filter((x) => x.status === "public");
      renderMyStories(myStories);
      renderPublicStories(publicStories);
    })
    .catch((err) => {
      notification(`⚠️ ${err}`);
      console.log(err);
    });
};

const renderMyStories = (stories) => {
  const el = document.getElementById("my-stories");
  el.innerHTML = "";
  stories.forEach((story) => {
    const newDiv = document.createElement("tr");
    newDiv.innerHTML = myStoryTemplate(story);
    el.appendChild(newDiv);
  });
};

const renderPublicStories = (stories) => {
  const el = document.getElementById("all-stories");
  el.innerHTML = "";
  stories.forEach((story) => {
    if (story.createdAt === 0) {
      return;
    }
    const newDiv = document.createElement("div");
    newDiv.className = "col";
    newDiv.innerHTML = publicStoryTemplate(story);
    el.appendChild(newDiv);
  });
};

const myStoryTemplate = (story) => {
  return `
    <td><a href="#viewModal" data-id="${
      story.createdAt
    }" class="modal-trigger open-view">${story.title}</a></td>
    <td>${new Date(story.createdAt * 1000)}</td>
    <td><span class="dash-status">${story.status}</span></td>
    <td>
      <button type="submit" data-id="${
        story.createdAt
      }" class="btn red btn-small delete-story">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
};

const publicStoryTemplate = (story) => {
  return `
    <div class="card">
      <div class="card-content center-align">
        <h5>${story.title}</h5>
        <p>${story.description.slice(0, 30)}${
    story.description.length > 30 ? "..." : ""
  }</p>
        <br />
        <div class="chip">
          <a href="#">${story.owner.slice(0, 5)}...${story.owner.slice(-5)}</a>
        </div>
      </div>
      <div class="card-action center-align">
        <button
          data-target="viewModal"
          id="vm"
          data-id="${story.createdAt}"
          class="btn btn-grey modal-trigger open-view"
        >
          Read More
        </button>
      </div>
    </div>
  `;
};

$(document).on("click", ".delete-story", function () {
  const id = $(this).data("id");
  deleteStory(id);
});

$(document).on("click", ".open-view", function () {
  const id = $(this).data("id");
  showStory(id);
});

document.getElementById("connectAccount").addEventListener("click", (e) => {
  connectCeloWallet().then(() => {
    document.getElementById("main").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("account").innerHTML = `${kit.defaultAccount.slice(
      0,
      5
    )}...${kit.defaultAccount.slice(-5)}`;
    getStories();
  });
});

document.querySelector("#newStory").addEventListener("click", async (e) => {
  let id = "";
  const characters = "01234567890";
  while (id.length < 12) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const params = [
    id,
    document.getElementById("title").value,
    document.getElementById("description").value,
    document.getElementById("status").value,
  ];
  notification(`⌛ Adding "${params[1]}"...`);
  try {
    const result = await contract.methods
      .createStory(...params)
      .send({ from: kit.defaultAccount });

    notification(`🎉 You successfully added "${params[1]}".`);
    document.getElementById("closeAdd").click();
    getStories();
  } catch (error) {
    console.log(error);
    notification(`⚠️ ${error}.`);
  }
});

const deleteStory = (id) => {
  try {
    notification(`🎉 Deleting your story...`);
    contract.methods
      .deleteStory(id)
      .send({ from: kit.defaultAccount })
      .then(() => {
        notification(`🎉 You successfully deleted the story`);
        getStories();
      });
  } catch (error) {
    console.log(error);
    notification(`⚠️ ${error}.`);
  }
};

function notification(_text) {
  document.querySelector(".alert").style.display = "block";
  document.querySelector("#notification").textContent = _text;
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 5000);
}
