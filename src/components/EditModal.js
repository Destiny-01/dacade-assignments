import { FormSelect } from "materialize-css";
import { useEffect, useState } from "react";
import { editStory } from "../utils/near";

export default function EditModal({ story, fetchStories }) {
  useEffect(() => {
    FormSelect.init(document.querySelector(`#status-edit-${story.id}`));
  }, [story]);
  const [editedStory, setEditedStory] = useState({
    title: story.title,
    description: story.description,
    status: story.status,
  });
  const handleChange = (e) => {
    setEditedStory({ ...editedStory, [e.target.name]: e.target.value });
  };
  return (
    <div>
      <div className="modal-content">
        <h4 className="center">Edit Your Story</h4>
        <div className="row">
          <form action="/stories" method="POST" className="col s12">
            <div className="row">
              <div className="input-field">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={editedStory.title}
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
                  value={editedStory.status}
                  onChange={handleChange}
                  name="status"
                  id={`status-edit-${story.id}`}
                >
                  <option value="1">Public</option>
                  <option value="2">Private</option>
                </select>
                <label htmlFor={`status-edit-${story.id}`}>Status</label>
              </div>
            </div>
            <div className="row mt5">
              <div className="input-field">
                <input
                  value={editedStory.description}
                  onChange={handleChange}
                  type="text"
                  name="description"
                  id="description"
                />
                <label className="active" htmlFor="description">
                  Description
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-footer">
        <button
          className="btn"
          id="newstories"
          onClick={() =>
            editStory(story.id, editedStory).then((res) => {
              window.location.reload();
            })
          }
        >
          Save
        </button>
        <a
          href="#!"
          id="closeEdit"
          className="modal-close waves-effect waves-green btn-flat"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
