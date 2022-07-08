import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import marketplaceAbi from "../contract/story.abi.json";

const ERC20_DECIMALS = 18;
const MPContractAddress = "0x06b57ca3562a51aB1257895cbB2C844DE2f09f6B";

let kit;
let contract;
let products = [];

const connectCeloWallet = async function () {
  if (window.celo) {
    try {
      notification("⚠️ Please approve this DApp to use it.");
      await window.celo.enable();
      notificationOff();
      const web3 = new Web3(window.celo);
      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];
      const bal = await kit.getTotalBalance(accounts[0]);
      console.log(bal);

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress);
      console.log(contract);
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.");
  }
};

const getBalance = () => {
  console.log(kit);
  if (!kit) {
    return;
  }
  console.log("hmmmm", kit.defaultAccount);
  kit.getTotalBalance(kit.defaultAccount).then((totalBalance) => {
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    console.log(cUSDBalance);
    if (!cUSDBalance) {
      document.getElementById("balance").innerHTML = "Connect Wallet";
    }
    document.getElementById(
      "balance"
    ).innerHTML = `${cUSDBalance} cUSD in account ${kit.defaultAccount.slice(
      0,
      5
    )}...${kit.defaultAccount.slice(-5)}`;
  });
};

const showStory = (id) => {
  console.log("ok", id);
  contract.methods
    .getStory(id)
    .call()
    .then((story) => {
      console.log(story);
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

const getProducts = () => {
  console.log("Get Products", contract.methods);
  contract.methods
    .getStories()
    .call()
    .then((stories) => {
      console.log(stories);
      const myStories = stories.filter(
        (x) =>
          x.owner.toUpperCase() === window.celo.selectedAddress.toUpperCase()
      );
      if (myStories.length === 0) {
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

$(document).on("click", ".open-view", () => {
  const id = $(".open-view").data("id");
  console.log(id, $(".open-view"));
  showStory(id);
});

$(document).on("click", ".delete-story", () => {
  const id = $(".delete-story").data("id");
  console.log(id, $(".delete-story"));
  deleteStory(id);
});

document.getElementById("balance1").addEventListener("click", (e) => {
  connectCeloWallet().then(() => {
    console.log("first");
    document.getElementById("main").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("balance").innerHTML = `${kit.defaultAccount.slice(
      0,
      5
    )}...${kit.defaultAccount.slice(-5)}`;
    getProducts();
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
    console.log(params, contract.methods);
    const result = await contract.methods
      .createStory(...params)
      .send({ from: kit.defaultAccount });
    console.log(result);

    notification(`🎉 You successfully added "${params[1]}".`);
    document.getElementById("closeAdd").click();
    getProducts();
  } catch (error) {
    console.log(error);
    notification(`⚠️ ${error}.`);
  }
});

const deleteStory = (id) => {
  try {
    contract.methods
      .deleteStory(id)
      .send({ from: kit.defaultAccount })
      .then((result) => {
        console.log(result);

        notification(`🎉 You successfully deleted the story`);
        getProducts();
      });
  } catch (error) {
    console.log(error);
    notification(`⚠️ ${error}.`);
  }
};

function notification(_text) {
  document.querySelector(".alert").style.display = "block";
  document.querySelector("#notification").textContent = _text;
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none";
}
