import { useEffect } from "react";
import { formatDate } from "../utils/near";
import { Modal } from "materialize-css";

export default function AllStories({ story }) {
  useEffect(() => {
    const elems = document.querySelectorAll(".modal");
    Modal.init(elems);
  }, []);
  return (
    <>
      <div className="col">
        <div className="card">
          <div className="card-content center-align">
            <h5>{story.title}</h5>
            <p>
              {story.description.length > 30
                ? story.description.slice(30)
                : story.description}
            </p>
            <br />
            <div className="chip">
              <a href="#">{story.owner}</a>
            </div>
          </div>
          <div className="card-action center-align">
            <button
              data-target={`viewModal-${story.id}-a`}
              className="btn btn-grey modal-trigger open-view"
            >
              Read More
            </button>
          </div>
        </div>
        <div
          id={`viewModal-${story.id}-a`}
          className="modal modal-fixed-footer"
        >
          <div className="modal-content" id="viewModalContent">
            <h4>{story.title}</h4>
            <h6>{formatDate(story.createdAt)}</h6>
            <p>{story.description}</p>
          </div>
          <div className="modal-footer">
            <a
              href="#!"
              className="modal-close waves-effect waves-green btn-flat"
            >
              Close
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
