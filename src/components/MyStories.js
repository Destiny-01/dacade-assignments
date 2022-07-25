import { FormSelect, Modal } from "materialize-css";
import { useEffect } from "react";
import { deleteStory, formatDate } from "../utils/near";
import EditModal from "./EditModal";

export default function MyStories({ stories, fetchStories }) {
  useEffect(() => {
    const elems = document.querySelectorAll(".modal");
    Modal.init(elems);
    FormSelect.init(document.querySelector("#status"));
  }, [stories]);
  const deleteStor = (id) => {
    deleteStory(id).then((res) => window.location.reload());
  };

  return (
    <>
      {stories && stories.length > 0 ? (
        <div className="container">
          <h3>Welcome</h3>
          <p>Here are your stories</p>
          <table className="striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody id="my-stories">
              {stories &&
                stories.map((story, i) => {
                  return (
                    <tr key={i}>
                      <td>
                        <a
                          href={`#viewModal-${story.id}-m`}
                          className="modal-trigger"
                        >
                          {story.title}
                        </a>
                      </td>
                      <td>{formatDate(story.createdAt)}</td>
                      <td>
                        <span className="dash-status">
                          {story.status === "1" ? "Public" : "Private"}
                        </span>
                      </td>
                      <td>
                        <button
                          data-target={`editModal-${story.id}`}
                          className="btn btn-small edit modal-trigger"
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          onClick={() => deleteStor(story.id)}
                          className="btn red btn-small"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>
          You haven't created any stories. Why not create one using the plus
          button at the bottom right
        </p>
      )}
      {stories &&
        stories.map((stor, i) => {
          return (
            <>
              <div
                key={i}
                id={`viewModal-${stor.id}-m`}
                className="modal modal-fixed-footer"
              >
                <div className="modal-content" id="viewModalContent">
                  <div className="row">
                    <div className="col s12 m8">
                      <h4>{stor.title}</h4>
                    </div>
                    <div className="col s12 m4">
                      <button
                        data-target={`editModal-${stor.id}`}
                        onClick={() =>
                          document.getElementById("closeMy").click()
                        }
                        className="btn btn-small edit modal-trigger"
                      >
                        <i className="fas fa-edit" />
                      </button>
                      <button
                        onClick={() => deleteStor(stor.id)}
                        className="btn red btn-small"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                  <h6>
                    {stor.status === 1 ? "Public" : "Private"} story by{" "}
                    {stor.owner} on {formatDate(stor.createdAt)}
                  </h6>
                  <p>{stor.description}</p>
                </div>
                <div className="modal-footer">
                  <a
                    href="#!"
                    id="closeMy"
                    className="modal-close waves-effect waves-green btn-flat"
                  >
                    Close
                  </a>
                </div>
              </div>
              <div
                key={i}
                id={`editModal-${stor.id}`}
                className="modal modal-fixed-footer"
              >
                <EditModal story={stor} fetchStories={fetchStories} />
              </div>
            </>
          );
        })}
    </>
  );
}
