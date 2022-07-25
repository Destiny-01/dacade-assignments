import React from "react";
import { login } from "../utils/near";

export default function Login({ toggle }) {
  return (
    <div className="card" id="login">
      <div className="card-content">
        <h3>
          <i className="fas fa-book-reader" />
          Storybooks
        </h3>
        <div className="section">
          <p className="lead">
            Create public and private stories from your life and see other's
            public stories
          </p>
        </div>
        <div className="divider" />
        <div className="section">
          <button className="btn red darken-1" onClick={login}>
            Connect Wallet to Continue
          </button>
        </div>
      </div>
    </div>
  );
}
