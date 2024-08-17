"use client";
require("dotenv").config();

export default function Home() {
  return (
    <div className="container-fluid mt-5 d-flex justify-content-center">
      <div id="content" className="row">
        <div id="content-inner" className="col">
          <div className="text-center">
            <h1 id="title" className="fw-bold">
              CRYPTO WALLET
            </h1>
            <p id="sub-title" className="mt-4" fw-bold>
              <span>Manage your crypto</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
