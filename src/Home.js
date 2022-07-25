import { useCallback, useEffect, useState } from "react";
import { FormSelect, Modal } from "materialize-css";
import MyStories from "./components/MyStories";
import AllStories from "./components/AllStories";
import Loader from "./components/Loader";
import { createStory, getMyStories, getStories } from "./utils/near";

export default function Home() {
  const [stories, setStories] = useState([]);
  const [pubStories, setPubStories] = useState([]);
  const account = window.walletConnection.account();
  const [story, setStory] = useState({
    title: "",
    description: "",
    status: "1",
  });
  const handleChange = (e) => {
    setStory({ ...story, [e.target.name]: e.target.value });
  };
  const fetchStories = useCallback(async () => {
    if (account.accountId) {
      setPubStories(await getStories());
      setStories(await getMyStories());
    }
  });
  console.log(story);
  useEffect(() => {
    const elems = document.querySelectorAll(".modal");
    let b = Modal.init(elems);
    console.log(b);
    console.log("hmmmm");
    FormSelect.init(document.querySelector("#status"));
    fetchStories();
  }, []);
  return (
    <>
      {pubStories && pubStories.length > 0 ? (
        <div id="main">
          <div className="header">
            <nav className="grey darken-3">
              <div className="nav-wrapper container">
                <a href="/dashboard" className="brand-logo center">
                  StoryBooks
                </a>
                <ul className="right">
                  <li>
                    <button
                      className="waves-effect waves-light btn"
                      id="account"
                    >
                      {window.walletConnection.account().accountId}
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <div className="add_btn">
            <div className="fixed-action-btn">
              <button
                data-target="addModal"
                className="btn-floating btn-large waves-effect btn modal-trigger waves-light red"
              >
                <i className="fa fa-plus" />
              </button>
            </div>
          </div>
          <div className="alert mt-2">
            <span id="notification">⌛ Loading...</span>
          </div>
          <MyStories stories={stories} fetchStories={fetchStories} />
          <div className="container">
            <h1 className="center">All Public Stories</h1>
            <div className="row">
              {pubStories &&
                pubStories.map((stor, i) => {
                  return <AllStories key={i} story={stor} />;
                })}
            </div>
          </div>
          {/* Modal Structure */}
          <div id="addModal" className="modal modal-fixed-footer">
            <div className="modal-content">
              <h4 className="center">Create New Story</h4>
              <div className="row">
                <form action="/stories" method="POST" className="col s12">
                  <div className="row">
                    <div className="input-field">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        placeholder="40 characters max. Elaborate in description"
                        value={story.title}
                        onChange={handleChange}
                        maxLength={40}
                      />
                      <label className="active" htmlFor="title">
                        Title
                      </label>
                    </div>
                  </div>
                  <div className="row">
                    <div className="input-field">
                      <select
                        value={story.status}
                        onChange={handleChange}
                        name="status"
                        id="status"
                      >
                        <option value="1">Public</option>
                        <option value="2">Private</option>
                      </select>
                      <label htmlFor="status">Status</label>
                    </div>
                  </div>
                  <div className="row mt5">
                    <div className="input-field">
                      <input
                        value={story.description}
                        onChange={handleChange}
                        type="text"
                        name="description"
                        id="description"
                      />
                      <label htmlFor="description">Description</label>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => {
                  createStory(story).then((res) => {
                    fetchStories();
                    document.getElementById("closeAdd").click();
                  });
                }}
              >
                Save
              </button>
              <a
                href="#!"
                id="closeAdd"
                className="modal-close waves-effect waves-green btn-flat"
              >
                Cancel
              </a>
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
}
